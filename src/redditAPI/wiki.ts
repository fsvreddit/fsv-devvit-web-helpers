import { context, reddit, UpdateWikiPageOptions, WikiPage } from "@devvit/web/server";
import { marked } from "marked";

export async function updateWikiPageMulti (options: UpdateWikiPageOptions): Promise<WikiPage> {
    const isV2WikiEnabled = await reddit.isWikiV2Enabled(context.subredditName);

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
    }

    return Promise.all(promises).then(results => results[0]);
}
