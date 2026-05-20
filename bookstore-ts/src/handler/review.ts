import type { ReviewStore } from "../store/review";
import { writeError, writeJSON } from "./response";

export class ReviewHandler {
  constructor(private reviews: ReviewStore) {}

  listReviews = (req: Request): Response => {
    const bookID = parseInt((req as any).params?.id);
    if (isNaN(bookID)) return writeError(500, "invalid book id");
    try {
      const reviews = this.reviews.listByBook(bookID);
      return writeJSON(200, reviews);
    } catch {
      return writeError(500, "failed to list reviews");
    }
  };

  createReview = async (req: Request): Promise<Response> => {
    const bookID = parseInt((req as any).params?.id);
    if (isNaN(bookID)) return writeError(500, "invalid book id");
    let body: { rating: number; review_text: string };
    try {
      body = await req.json();
    } catch {
      return writeError(400, "invalid body");
    }
    try {
      const review = this.reviews.create(bookID, body.rating, body.review_text);
      return writeJSON(201, review);
    } catch (e: any) {
      return writeError(500, e?.message ?? "failed to create review");
    }
  };
}
