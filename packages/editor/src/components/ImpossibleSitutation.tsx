import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export default function ImpossibleSitutation() {
	return (
		<Alert variant="destructive">
			<AlertCircleIcon />
			<AlertDescription>
				Impossible situation encountered. Please restart the application.
			</AlertDescription>
		</Alert>
	);
}
