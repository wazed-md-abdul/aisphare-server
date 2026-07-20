import mongoose, { Schema } from "mongoose";
const AnalysisReportSchema = new Schema({
    owner: { type: String, index: true },
    filename: String,
    result: Schema.Types.Mixed,
}, { timestamps: true });
export const AnalysisReport = mongoose.models.AnalysisReport ||
    mongoose.model("AnalysisReport", AnalysisReportSchema);
//# sourceMappingURL=analysis-report.model.js.map