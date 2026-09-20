import { context, UserSocialLink } from "@devvit/web/server";
import { getExtendedDevvit } from ".";

type UserSocialLinkResponse = Omit<UserSocialLink, "handle"> & { handle: string | null };

export async function getUserSocialLinks (username: string): Promise<UserSocialLink[]> {
    const gql = getExtendedDevvit().redditAPIPlugins.GraphQL;
    const response = await gql.PersistedQuery({
        operationName: "GetUserSocialLinks", // Name and ID are both from <https://github.com/reddit/devvit/blob/f083/packages/public-api/src/apis/reddit/models/User.ts#L437-L438>
        id: "2aca18ef5f4fc75fb91cdaace3e9aeeae2cb3843b5c26ad511e6f01b8521593a",
        variables: {
            name: username,
        },
    }, context.metadata);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!response.data?.user?.profile?.socialLinks) {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return response.data.user.profile.socialLinks.map((link: UserSocialLinkResponse) => ({
        ...link,
        handle: link.handle ?? undefined,
    }));
}
