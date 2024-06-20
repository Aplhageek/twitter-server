import { initServer } from "./App"
import config from "./config/config";

async function init() {
    const app = await initServer();
    app.listen(config.port, () => console.log(`Server started at PORT : 8000`));
}


init();