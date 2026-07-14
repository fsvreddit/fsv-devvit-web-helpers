import { context, reddit, redis, settings, TaskRequest, TaskResponse, WikiPage } from "@devvit/web/server";
import { Context } from "hono";
import json2md from "json2md";
import { lt } from "semver";

interface AppUpdate {
    appname: string;
    version: string;
    whatsNewBullets: string[];
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type UpgradeNotifierData = {
    settingName?: string;
    appFriendlyName?: string;
    updateSubreddit?: string;
    updateWikiPage?: string;
};

const DEFAULT_UPDATE_SUBREDDIT = "fsvapps";
const DEFAULT_UPDATE_WIKI_PAGE = "upgrade-notifier";

export const handleUpgradeNotifier = async (c: Context) => {
    const request = await c.req.json<TaskRequest<UpgradeNotifierData | undefined>>();

    if (!request.data) {
        console.error("Update Checker: No data provided in request");
        return c.json<TaskResponse>({ message: "upgrade notifier: no data provided" }, 400);
    }

    if (request.data.settingName) {
        const checkForUpdates = await settings.get<boolean>(request.data.settingName);
        if (!checkForUpdates) {
            console.log("Update Checker: Upgrade notifier is disabled");
            return;
        }
    }

    const updateSubreddit = request.data.updateSubreddit ?? DEFAULT_UPDATE_SUBREDDIT;
    const updateWikiPage = request.data.updateWikiPage ?? DEFAULT_UPDATE_WIKI_PAGE;

    let wikiPage: WikiPage;
    try {
        wikiPage = await reddit.getWikiPage(updateSubreddit, updateWikiPage);
    } catch {
        console.error(`Update Checker: Error getting wiki page ${updateWikiPage} from ${updateSubreddit}`);
        return c.json<TaskResponse>({ message: "upgrade notifier: could not retrieve wiki page" }, 500);
    }

    const updates = JSON.parse(wikiPage.content) as AppUpdate[];
    const updatesForThisApp = updates.filter(update => update.appname === context.appSlug);
    if (updatesForThisApp.length === 0) {
        console.log(`Update Checker: No updates found for app ${context.appSlug}`);
        return c.json<TaskResponse>({ message: "upgrade notifier: no updates found" }, 200);
    }

    if (updatesForThisApp.length > 1) {
        console.error(`Update Checker: Multiple updates found for app ${context.appSlug}`);
        return c.json<TaskResponse>({ message: "upgrade notifier: multiple updates found" }, 500);
    }

    const update = updatesForThisApp[0];

    if (!lt(context.appVersion, update.version)) {
        console.log("Update Checker: No relevant updates found");
        return c.json<TaskResponse>({ message: "upgrade notifier: no relevant updates found" }, 200);
    }

    const redisKey = "fdwh:update-notification-sent";
    const notificationSent = await redis.get(redisKey);
    if (notificationSent === update.version) {
        console.log("Update Checker: Update notification already sent");
        return c.json<TaskResponse>({ message: "upgrade notifier: update notification already sent" }, 200);
    }

    const message: json2md.DataObject[] = [
        { p: `A new version of ${request.data.appFriendlyName} is available to install.` },
    ];

    if (update.whatsNewBullets.length > 0) {
        message.push({ p: "Here's what's new:" });
        message.push({ ul: update.whatsNewBullets });
    }

    message.push({ p: `To install this update, or to disable these notifications, visit the [**${request.data.appFriendlyName ?? "App"} configuration page**](https://developers.reddit.com/r/${context.subredditName}/apps/${context.appSlug}) for /r/${context.subredditName}.` });

    await reddit.modMail.createModNotification({
        subredditId: context.subredditId,
        subject: `New update available for ${request.data.appFriendlyName ?? context.appSlug}: v${update.version}`,
        bodyMarkdown: json2md(message),
    });

    return c.json<TaskResponse>({ message: "upgrade notifier handled" }, 200);
};
