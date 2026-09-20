import { context, Post } from "@devvit/web/server";
import { getExtendedDevvit } from ".";

export enum CrowdControlOption {
    None = "ignore",
    Off = "0",
    Moderate = "1",
    High = "2",
    Maximum = "3",
}

export async function setCrowdControl (post: Post, crowdControlOption: CrowdControlOption) {
    let level: number;
    switch (crowdControlOption) {
        case CrowdControlOption.Off:
            level = 0;
            break;
        case CrowdControlOption.Moderate:
            level = 1;
            break;
        case CrowdControlOption.High:
            level = 2;
            break;
        case CrowdControlOption.Maximum:
            level = 3;
            break;
        default:
            return;
    }

    await getExtendedDevvit().redditAPIPlugins.Moderation.UpdateCrowdControlLevel({ id: post.id, level }, context.metadata);
    console.log(`Crowd control level set to ${crowdControlOption}`);
}
