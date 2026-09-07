import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/getImageUrl",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.searchParams.get("id");
    if (!storageId) return new Response("Missing id", { status: 400 });

    try {
      const imageUrl = await ctx.runQuery(internal.meals.getImageUrl, { storageId: storageId as any });
      if (!imageUrl) return new Response("Not found", { status: 404 });
      return Response.redirect(imageUrl, 302);
      // redirect to the underlying storage URL
    } catch (e) {
      return new Response("Bad storage id", { status: 400 });
    }
  }),
});

export default http;
