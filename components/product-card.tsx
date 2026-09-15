import Link from "next/link";
import { Product, deliveryDays, discountPercent, productHref } from "@/lib/catalog";
import { deliveryDate, usd } from "@/lib/format";
import { Badge, Price, PrimeCheck, ProductImage, Stars } from "@/components/ui";
import { QuickAddButton } from "@/components/cart/quick-add";

/** Search result card, following the Amazon results layout: image, title, rating, social proof, price, delivery, CTA. */
export function ResultCard({ product: p, priority }: { product: Product; priority?: boolean }) {
  const href = productHref(p);
  const off = discountPercent(p);
  return (
    <article className="flex flex-row gap-3 border-b border-line bg-white py-3 last:border-b-0 sm:flex-col sm:gap-0 sm:rounded-md sm:border sm:border-[#e7e7e7] sm:py-0 sm:transition-shadow sm:duration-200 sm:ease-(--ease-amzn) sm:hover:shadow-[0_4px_14px_rgba(15,17,17,.14)]">
      <Link href={href} className="relative block w-[42%] shrink-0 self-start sm:w-full" tabIndex={-1} aria-hidden>
        <ProductImage src={p.thumbnail} alt="" sizes="(max-width: 640px) 45vw, 260px" priority={priority} className="aspect-square rounded sm:rounded-b-none sm:rounded-t-md" />
        {p.badge && (
          <span className="absolute left-0 top-2">
            <Badge>{p.badge}</Badge>
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-[3px] sm:px-3 sm:pb-3 sm:pt-2">
        <h2 className="text-[16px] leading-[22px] sm:min-h-[40px] sm:text-[15px] sm:leading-[20px]">
          <Link href={href} className="line-clamp-3 text-ink transition-colors duration-150 hover:text-link-hover sm:line-clamp-2">
            {p.brand && !p.title.toLowerCase().startsWith(p.brand.toLowerCase()) ? <span className="font-bold">{p.brand} </span> : null}
            {p.title}
          </Link>
        </h2>
        <Stars rating={p.rating} count={p.reviewCount} size={15} />
        {/* Reserve the social-proof line on grid cards so prices line up across a row. */}
        <p className={`text-[13px] text-muted ${p.boughtLastMonth ? "" : "hidden sm:invisible sm:block"}`} aria-hidden={!p.boughtLastMonth}>
          {p.boughtLastMonth ?? "—"} bought in past month
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          {off > 0 && <span className="text-[13px] text-deal">-{off}%</span>}
          <Link href={href}>
            <Price value={p.price} size="md" />
          </Link>
          {p.listPrice && (
            <span className="text-[12px] text-muted">
              List: <s>{usd(p.listPrice)}</s>
            </span>
          )}
        </div>
        <div className="text-[13px] leading-[18px]">
          <PrimeCheck />
          <p>
            FREE delivery <span className="font-bold">{deliveryDate(deliveryDays(p), undefined, "short")}</span>
          </p>
          {p.stock <= 10 && <p className="text-deal">Only {p.stock} left in stock - order soon.</p>}
        </div>
        <div className="mt-2 sm:mt-auto sm:pt-2">
          {p.variation && p.variation.options.length > 1 ? (
            <Link href={href} className="btn-white w-full sm:w-auto">
              See options
            </Link>
          ) : (
            <QuickAddButton product={p} />
          )}
        </div>
      </div>
    </article>
  );
}

/** Compact tile for carousels and homepage rows. */
export function MiniCard({ product: p }: { product: Product }) {
  const off = discountPercent(p);
  return (
    <Link href={productHref(p)} className="group flex w-[150px] shrink-0 flex-col gap-1 sm:w-[180px]">
      <div className="overflow-hidden rounded">
        <ProductImage src={p.thumbnail} alt={p.title} sizes="180px" className="aspect-square transition-transform duration-200 ease-(--ease-amzn) group-hover:scale-[1.03]" />
      </div>
      <span className="mt-1 flex h-[20px] items-center gap-2">
        {off > 0 && (
          <>
            <span className="rounded-sm bg-deal px-[6px] py-[2px] text-[12px] font-bold leading-[14px] text-white">{off}% off</span>
            <span className="text-[12px] font-bold text-deal">Limited time deal</span>
          </>
        )}
      </span>
      <span className="line-clamp-2 min-h-[36px] text-[13px] leading-[18px] text-link group-hover:text-link-hover group-hover:underline">{p.title}</span>
      <Stars rating={p.rating} count={p.reviewCount} size={13} />
      <Price value={p.price} size="sm" />
    </Link>
  );
}
