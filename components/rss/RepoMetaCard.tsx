interface RepoMetadataCardProps {
  label: string;
  value?: string;
  icon: React.ReactNode;
  color?: string;
}

export const RepoMetadataCard = ({
  label,
  value,
  icon,
  color = "bg-gray-100",
}: RepoMetadataCardProps) => {
  if (!value) return null;

  return (
    <div className={`${color} p-3 rounded-lg flex items-center gap-3`}>
      <div className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="font-medium text-gray-700 dark:text-gray-200">
          {Number(value).toLocaleString()}
        </p>
      </div>
    </div>
  );
};
