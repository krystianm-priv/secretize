import { CipherProvider } from "./components/cipher.context";
import { ScreenProvider } from "./components/screen.context";
import { Alert, AlertDescription } from "./components/ui/alert";

function App() {
	return (
		<div className="h-full">
			<Alert variant="default">
				<AlertDescription>
					This application works totally locally, however, for even better
					security we recommend to <b>disable your internet connection</b>
				</AlertDescription>
			</Alert>
			<CipherProvider>
				<ScreenProvider />
			</CipherProvider>
		</div>
	);
}

export default App;
