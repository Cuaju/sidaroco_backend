import "dotenv/config";
import app from "./app";

const PORT = process.env.FLEET_SERVICE_PORT || 3000;

app.listen(PORT, () => console.log(`Fleet Service running on port ${PORT}`));

