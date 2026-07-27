import Link from "next/link";

export default function DestinationCard({ dest }) {
  return (
    <Link href={`/destinasi/${dest._id}`} className="card">
      <div className="card-top" />
      <div className="card-media">
        {dest.images && dest.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dest.images[0]} alt={dest.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span>{dest.category?.toUpperCase()}</span>
        )}
      </div>
      <div className="card-body">
        <span className="card-eyebrow">{dest.regency}</span>
        <h3>{dest.name}</h3>
        <p>{dest.description?.slice(0, 110)}{dest.description?.length > 110 ? "…" : ""}</p>
        <div className="card-footer">
          <span className="tag-pill">{dest.category}</span>
          <span>{dest.entryFee?.split(" (")[0]}</span>
        </div>
      </div>
    </Link>
  );
}
