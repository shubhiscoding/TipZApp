import { google } from "googleapis";

export async function fetchYouTubeChannelId(accessToken: string) {
    const youtube = google.youtube({
        version: "v3",
        auth: accessToken,
    });

    const response = await youtube.channels.list({
        part: ["id"],
        mine: true,
    });

    return response.data.items?.[0]?.id || null;
}