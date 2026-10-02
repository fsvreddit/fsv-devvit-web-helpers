import { context, reddit, UpdateWikiPageOptions, WikiPage } from "@devvit/web/server";
import { marked } from "marked";

export async function updateWikiPageMulti (options: UpdateWikiPageOptions, verboseLogs = false): Promise<WikiPage> {
    const isV2WikiEnabled = await reddit.isWikiV2Enabled(context.subredditName);

    if (verboseLogs) {
        console.log(`Wiki Update: v2 enabled: ${isV2WikiEnabled}`);
    }

    const promises: Promise<WikiPage>[] = [
        reddit.updateWikiPage({
            ...options,
            wikiVersion: "v1",
        }),
    ];

    if (isV2WikiEnabled) {
        const contentHtml = await Promise.resolve(marked(options.content));
        promises.push(reddit.updateWikiPage({
            ...options,
            content: contentHtml,
            wikiVersion: "v2",
        }));

        if (verboseLogs) {
            console.log(`Wiki Update: v2 content HTML generated`);
        }
    }

    return Promise.all(promises).then(results => results[0]);
}
