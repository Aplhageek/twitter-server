import { initServer } from "./App"
import { config } from "./config";

async function init() {
    const app = await initServer();
    app.listen( config.env.port , () => console.log(`Server started at PORT : ${config.env.port}`));
    
}


init();