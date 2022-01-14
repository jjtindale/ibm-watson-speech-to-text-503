import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import ws from "ws";
import { sleep } from "./sleep";

const NUMBER_OF_CONNECTIONS = 99;
const MILLIS_BETWEEN_CONNECTIONS = 2000;
const KEEP_ALIVE_TRANSCRIPTION_INTERVAL_MILLIS = 10000;
const MINIMAL_LOGGING = true;

dotenv.config();

const filepath = path.resolve(__dirname, "sea.wav");
const wav = fs.readFileSync(filepath);

const connectWebSocket = (id: string, accessToken: string) => {
    const url = "wss://api.eu-gb.speech-to-text.watson.cloud.ibm.com" +
        `/instances/${process.env.INSTANCE!}/v1/recognize?model=en-UK_NarrowbandModel&access_token=${accessToken}`;
    const webSocket = new ws.WebSocket(url);
    webSocket.onopen = (ev) => console.log(id, "open");
    if (!MINIMAL_LOGGING) {
        webSocket.onclose = (ev) => console.log(id, "close");
        webSocket.onerror = (ev) => console.log(id, "error", ev.message);
    }
    webSocket.onmessage = (ev) => {
        const data = JSON.parse(ev.data.toString("utf-8"));

        const isTranscriptionMessage = !!data.results;
        const isListeningMessage = data?.state === "listening";
        if (isTranscriptionMessage) {
            if (!MINIMAL_LOGGING) {
                console.log(id, "transcription");
            }
        } else if (isListeningMessage) {
            if (!MINIMAL_LOGGING) {
                console.log(id, "listening");
            }
        } else {
            console.log(id, ev.data);
        }
    };

    return webSocket;
};

const main = async () => {
    const response = await axios.request({
        url: "https://iam.cloud.ibm.com/identity/token",
        method: "POST",
        params: {
            grant_type: "urn:ibm:params:oauth:grant-type:apikey",
            apikey: process.env.API_KEY
        }
    });

    const accessToken = response.data.access_token;

    const sockets: ws.WebSocket[] = [];
    const keepAliveTick = setInterval(() => {
        sockets.forEach((s) => {
            if (s.readyState !== 1) {
                return;
            }
            s.send(JSON.stringify({
                action: "start",
                inactivity_timeout: -1,
                interim_results: true
            }));
            s.send(wav);
            s.send(JSON.stringify({
                action: "stop"
            }));
        });
    }, KEEP_ALIVE_TRANSCRIPTION_INTERVAL_MILLIS);

    for (let i = 1; i <= NUMBER_OF_CONNECTIONS; i++) {
        const id = i.toString().padStart(2, "0");
        const webSocket = connectWebSocket(id, accessToken);
        sockets.push(webSocket);
        await sleep(MILLIS_BETWEEN_CONNECTIONS);
    }

    await sleep(KEEP_ALIVE_TRANSCRIPTION_INTERVAL_MILLIS * 3);
    sockets.forEach(s => s.close());
    clearInterval(keepAliveTick);
};

main()
    .then(() => console.log("Done"))
    .catch(error => console.error(error));