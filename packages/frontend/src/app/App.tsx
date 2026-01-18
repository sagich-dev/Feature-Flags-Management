import { ToastContainer } from "react-toastify";
import AppProviders from "@/app/providers/AppProviders";
import Routes from "@/app/routes";

export default function App() {
	return (
		<AppProviders>
			<Routes />
			<ToastContainer theme="dark" position="bottom-center" pauseOnHover={true} closeOnClick={true} autoClose={5000} />
		</AppProviders>
	);
}
