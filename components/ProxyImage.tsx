export const ProxyImage = ({
  className,
  src,
  alt,
}: {
  className: string;
  src: string;
  alt: string;
}) => {
  const encodedUrl = encodeURIComponent(src);

  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading="lazy"
      src={`/api/image-proxy?url=${encodedUrl}`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
};
