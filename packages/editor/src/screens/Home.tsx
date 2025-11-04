"use client";

import { useRef, useState } from "react";
import { useCipher } from "@/components/cipher.context";
import ImpossibleSitutation from "@/components/ImpossibleSitutation";
import { screens, useScreen } from "@/components/screen.context";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
	const { setScreen } = useScreen();
	const { setCipher } = useCipher();

	const fileInput = useRef<HTMLInputElement>(null);
	const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<string | null>(null);
	const [privateKey, setPrivateKey] = useState("");
	const [isDecoding, setIsDecoding] = useState(false);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files?.length) {
			alert("No file selected.");
			return;
		}

		const selectedFile = files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result;
				if (typeof content === "string") {
					setUploadedFile(content);
					setShowPrivateKeyDialog(true);
				} else {
					alert("Failed to read file content.");
				}
			} catch (error) {
				alert(`Error reading file: ${error}`);
			}
		};
		reader.readAsText(selectedFile);
	};

	const handleDecrypt = async () => {
		if (!uploadedFile || !privateKey) {
			alert("Missing file or private key.");
			return;
		}

		setIsDecoding(true);
		try {
			// Simulate decrypt step for now
			const decoded = atob(uploadedFile);
			const parsed = JSON.parse(decoded);

			// Normally you'd decrypt secrets here with the private key
			// For now, just set cipher context and proceed
			setCipher({
				cipherText: uploadedFile,
				publicKey: parsed.publicKey ?? "",
                
			});

			setShowPrivateKeyDialog(false);
			setPrivateKey("");
			setScreen("Edit");
		} catch (error) {
			alert(`Failed to decode or decrypt file: ${error}`);
		} finally {
			setIsDecoding(false);
		}
	};

	return (
		<>
			{/* hidden input */}
			<input
				type="file"
				className="hidden"
				ref={fileInput}
				accept=".secretized"
				onChange={handleFileUpload}
			/>

			<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-sm">
					<Card>
						<CardHeader>
							<CardTitle>What would you like to do?</CardTitle>
							<CardDescription>
								Select an option below to get started.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-4">
							{Object.keys(screens).map((screenName) => {
								switch (screenName) {
									case "KeyGenerator":
										return (
											<Button
												key={screenName}
												onClick={() => setScreen("KeyGenerator")}
											>
												Generate keys and create your{" "}
												<code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">
													env.secretized
												</code>
											</Button>
										);

									case "Edit":
										return (
											<Button
												key={screenName}
												onClick={() => fileInput.current?.click()}
											>
												Upload existing{" "}
												<code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">
													env.secretized
												</code>{" "}
												file to edit
											</Button>
										);

									case "Home":
										return null;

									default:
										return <ImpossibleSitutation key={screenName} />;
								}
							})}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* 🔐 Private Key Prompt Dialog */}
			<Dialog
				open={showPrivateKeyDialog}
				onOpenChange={setShowPrivateKeyDialog}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Enter your Private Key</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<Label htmlFor="private-key">Private Key</Label>
						<Input
							id="private-key"
							placeholder="Paste your private key here"
							value={privateKey}
							onChange={(e) => setPrivateKey(e.target.value)}
						/>
						<ScrollArea className="h-24 rounded-md border bg-muted p-2">
							<pre className="text-xs font-mono whitespace-pre-wrap break-all">
								{uploadedFile?.slice(0, 400)}...
							</pre>
						</ScrollArea>
					</div>
					<DialogFooter>
						<Button
							variant="secondary"
							onClick={() => setShowPrivateKeyDialog(false)}
						>
							Cancel
						</Button>
						<Button disabled={isDecoding} onClick={handleDecrypt}>
							{isDecoding ? "Decrypting..." : "Decrypt and Continue"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
