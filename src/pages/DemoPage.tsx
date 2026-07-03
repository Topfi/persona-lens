import AssessmentReport from "../components/report/AssessmentReport";
import { assessmentDocSchema } from "../lib/schema/assessment";
import golden from "../fixtures/golden-assessment.json";

const doc = assessmentDocSchema.parse(golden);

export default function DemoPage() {
  return (
    <main>
      <div className="kicker" style={{ marginBottom: 20 }}>
        demo — the report that started this project: HN user Topfi, assessed from 441 public comments
      </div>
      <AssessmentReport doc={doc} />
    </main>
  );
}
