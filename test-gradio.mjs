import { Client } from "@gradio/client";

const client = await Client.connect(
  "recoX/birdparkpoem-emotion-ai"
);

const api = await client.view_api();

console.log(api);