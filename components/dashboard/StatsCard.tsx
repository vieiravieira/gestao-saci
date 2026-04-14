// components/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: number;
  color?: "blue" | "green" | "red" | "amber";
}

const colorMap = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-red-50 border-red-200 text-red-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
};

export default function StatsCard({ title, value, color = "blue" }: StatsCardProps) {
  return (
    <div className={`rounded-xl border p-6 ${colorMap[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}
