import mongoose, { Schema } from "mongoose";
const RecommendationSchema = new Schema({
    student: { type: String, index: true },
    profile: Schema.Types.Mixed,
    result: String,
}, { timestamps: true });
export const Recommendation = mongoose.models.Recommendation ||
    mongoose.model("Recommendation", RecommendationSchema);
//# sourceMappingURL=recommendation.model.js.map