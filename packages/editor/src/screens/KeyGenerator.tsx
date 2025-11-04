"use client";

import {
	Check,
	Copy,
	DownloadIcon,
	FileExclamationPointIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCipher } from "@/components/cipher.context";
import { useScreen } from "@/components/screen.context";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { SecretizedFile } from "@/lib/secret-file";
import { cn } from "@/lib/utils"; // optional if you have class merging util

export default function KeyGenerator() {
	const { setScreen } = useScreen();
	const { setCipher } = useCipher();
	const [keys, setKeys] = useState<{
		publicKey: string;
		privateKey: string;
	} | null>(null);
	const [copied, setCopied] = useState<"none" | "private" | "public">("none");

	useEffect(() => {
		generateKeys().then(setKeys);
	}, []);

	const handleCopy = async (value: string, type: "private" | "public") => {
		await navigator.clipboard.writeText(value);
		setCopied(type);
	};

	if (!keys) {
		return (
			<div className="flex flex-col space-y-4">
				<Skeleton className="h-6 w-[220px]" />
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-10 w-[160px]" />
			</div>
		);
	}

	function downloadFile() {
		if (!keys) {
			alert("Keys are not generated yet.");
			return;
		}
		const secretizedFile: SecretizedFile<["development", "production"]> = {
			modes: ["development", "production"],
			publicKey: keys.publicKey,
			secrets: [
				{
					name: "HELLO_WORLD",
					values: {
						development: "encrypted_value_dev",
						production: "encrypted_value_prod",
					},
					labels: {},
				},
			],
		};
		const contents = btoa(JSON.stringify(secretizedFile));
		const blob = new Blob([contents], { type: "application/octet-stream" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = encodeURI("env.secretized");
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		// Set the public key in the cipher context for further use
		setCipher((c) => ({
			...c,
			publicKey: keys.publicKey,
		}));
		// Navigate to the Edit screen
		setScreen("Edit");
	}

	return (
		<Card className="max-w-xl mx-auto shadow-md">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">
					🔐 Key Pair Generated
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<KeyField
					label="Public Key"
					value={keys.publicKey}
					copied={copied === "public"}
					onCopy={() => handleCopy(keys.publicKey, "public")}
				/>

				<KeyField
					label="Private Key"
					value={keys.privateKey}
					copied={copied === "private"}
					onCopy={() => handleCopy(keys.privateKey, "private")}
				/>
			</CardContent>
			<CardFooter className="flex gap-3">
				<Button
					variant="default"
					disabled={copied !== "private"}
					onClick={downloadFile}
				>
					{copied === "private" ? (
						<DownloadIcon />
					) : (
						<FileExclamationPointIcon />
					)}
					{copied === "private"
						? "Download env.secretized"
						: "Copy Private Key to Proceed (it will be discarded after you leave this page!)"}
				</Button>
			</CardFooter>
		</Card>
	);
}

/* ---------------------------------- Helper ---------------------------------- */

function KeyField({
	label,
	value,
	copied,
	onCopy,
}: {
	label: string;
	value: string;
	copied: boolean;
	onCopy: () => void;
}) {
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted-foreground">
					{label}
				</span>
				<Button
					variant="ghost"
					size="icon"
					className={cn("transition-colors", copied && "text-green-500")}
					onClick={onCopy}
				>
					{copied ? (
						<Check className="h-4 w-4" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</Button>
			</div>

			<ScrollArea className="rounded-md border bg-muted p-2 h-20">
				<pre className="text-xs font-mono whitespace-pre-wrap break-all">
					{value}
				</pre>
			</ScrollArea>

			{copied && (
				<p className="text-xs text-green-600 font-medium animate-fade-in">
					Copied {label.toLowerCase()}!
				</p>
			)}
		</div>
	);
}

/* ----------------------------- Key Generation ------------------------------- */

async function generateKeys() {
	const keyPair = await crypto.subtle.generateKey(
		{
			name: "ECDH",
			namedCurve: "P-256", // ✅ widely supported
		},
		true,
		["deriveKey", "deriveBits"],
	);

	const publicKeyRaw = new Uint8Array(
		await crypto.subtle.exportKey("raw", keyPair.publicKey),
	);
	const privateKeyRaw = new Uint8Array(
		await crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
	);

	const publicKeyB64 = btoa(String.fromCharCode(...publicKeyRaw));
	const privateKeyB64 = btoa(String.fromCharCode(...privateKeyRaw));

	return { publicKey: publicKeyB64, privateKey: privateKeyB64 };
}
