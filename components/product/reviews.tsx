import { UserCircle2 } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { Stars } from "@/components/ui";

/** Star histogram shaped around the product's average, plus the written reviews. */
function distribution(rating: number) {
  const weights = [5, 4, 3, 2, 1].map((s) => Math.exp(-Math.abs(s - rating) * 1.6));
  const sum = weights.reduce((a, b) => a + b, 0);
  const pct = weights.map((w) => Math.round((w / sum) * 100));
  pct[0] += 100 - pct.reduce((a, b) => a + b, 0);
  return pct;
}

export function Reviews({ product: p }: { product: Product }) {
  const pct = distribution(p.rating);
  return (
    <section id="reviews" className="grid scroll-mt-28 grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="text-[21px] font-bold">Customer reviews</h2>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={p.rating} size={20} />
          <span className="text-[16px]">out of 5</span>
        </div>
        <p className="mt-1 text-[14px] text-muted">{p.reviewCount.toLocaleString("en-US")} global ratings</p>
        <table className="mt-4 w-full text-[14px]">
          <tbody>
            {pct.map((v, i) => (
              <tr key={i}>
                <td className="w-[52px] whitespace-nowrap py-[5px] text-link">{5 - i} star</td>
                <td className="px-2">
                  <div className="h-[20px] overflow-hidden rounded-[4px] border border-[#d5d9d9] bg-[#f0f2f2] shadow-[inset_0_1px_2px_rgba(15,17,17,.15)]">
                    <div className="h-full bg-[#ffa41c]" style={{ width: `${v}%` }} />
                  </div>
                </td>
                <td className="w-[40px] text-right text-link">{v}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="mb-4 text-[18px] font-bold">Top reviews from the United States</h3>
        {p.reviews.length === 0 ? (
          <p className="text-[14px] text-muted">No written reviews yet.</p>
        ) : (
          <ul className="space-y-6">
            {p.reviews.map((r) => (
              <li key={r.reviewerName + r.date}>
                <p className="flex items-center gap-2 text-[13px]">
                  <UserCircle2 size={28} strokeWidth={1.2} className="text-muted" /> {r.reviewerName}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Stars rating={r.rating} size={14} />
                  <span className="text-[14px] font-bold">{r.comment}</span>
                </div>
                <p className="mt-1 text-[13px] text-muted">
                  Reviewed in the United States on{" "}
                  {new Date(r.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </p>
                <p className="text-[12px] font-bold text-[#c45500]">Verified Purchase</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
