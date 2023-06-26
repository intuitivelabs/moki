import { IconChartPieOff } from "@tabler/icons-react";

export default function NoData() {
  return (
    <div className="d-flex justify-content-center align-items-center 
      h-100 text-secondary">
      <div className="d-flex flex-column align-items-center">
        <IconChartPieOff size={28} style={{ verticalAlign: "middle" }} />
        <p style={{ fontSize: "0.8rem" }}>
          No data to display.
        </p>
      </div>
    </div>
  );
}
