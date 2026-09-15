import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categoryName, departmentName, getProduct, productHref, products, related } from "@/lib/catalog";
import { Gallery } from "@/components/product/gallery";
import { Purchase } from "@/components/product/purchase";
import { Reviews } from "@/components/product/reviews";
import { Shelf } from "@/components/carousel";
import { MiniCard } from "@/components/product-card";
import { Badge, Stars } from "@/components/ui";

type Props = { params: Promise<{ id: string; slug?: string[] }> };

export function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id), slug: [p.slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct(Number((await params).id));
  return p ? { title: p.title, description: p.description } : { title: "Page Not Found" };
}

/** "About this item" bullets: split the description into sentences and add the practical facts. */
function bullets(description: string, warranty: string, returns: string, weight: string) {
  const sentences = description.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [description];
  return [...sentences, `Warranty: ${warranty}.`, `Returns: ${returns}.`, `Item weight: ${weight}.`];
}

export default async function ProductPage({ params }: Props) {
  const { id, slug } = await params;
  const product = getProduct(Number(id));
  if (!product) notFound();
  if (slug?.[0] !== product.slug) permanentRedirect(productHref(product));

  const more = related(product);

  return (
    <div className="bg-white">
      <nav aria-label="Breadcrumb" className="px-3 pt-3 text-[12px] text-muted sm:px-5">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={`/s?dept=${product.department}`} className="hover:text-link-hover hover:underline">
              {departmentName(product.department)}
            </Link>
          </li>
          <ChevronRight size={12} aria-hidden />
          <li>
            <Link href={`/s?dept=${product.department}&cat=${product.category}`} className="hover:text-link-hover hover:underline">
              {categoryName(product.category)}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-x-6 px-3 pb-6 pt-3 sm:px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,40%)_minmax(0,1fr)_244px]">
        {/* Mobile heading sits above the gallery, as on Amazon's phone site */}
        <div className="mb-2 md:hidden">
          <Link href={`/s?k=${encodeURIComponent(product.brand ?? "")}`} className="link text-[13px]">
            Visit the {product.brand ?? "Generic"} Store
          </Link>
          <div className="float-right">
            <Stars rating={product.rating} count={product.reviewCount} size={14} href="#reviews" />
          </div>
          <h1 className="mt-1 text-[16px] leading-[22px]">{product.title}</h1>
        </div>

        <Gallery images={product.images} title={product.title} />

        <Purchase
          product={product}
          header={
            <div className="hidden md:block">
              <h1 className="text-[24px] leading-[32px]">{product.title}</h1>
              <Link href={`/s?k=${encodeURIComponent(product.brand ?? "")}`} className="link text-[14px]">
                Visit the {product.brand ?? "Generic"} Store
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Stars rating={product.rating} count={product.reviewCount} size={16} href="#reviews" />
              </div>
              {product.badge && (
                <div className="mt-2">
                  <Badge>{product.badge}</Badge>
                </div>
              )}
              {product.boughtLastMonth && (
                <p className="mt-2 text-[14px]">
                  <b>{product.boughtLastMonth} bought</b> <span className="text-muted">in past month</span>
                </p>
              )}
            </div>
          }
          details={
            <>
              <table className="mt-4 w-full text-[14px]">
                <tbody>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row" className="w-[40%] py-[5px] pr-3 text-left align-top font-bold">{k}</th>
                      <td className="py-[5px]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <hr className="my-4 border-line" />
              <h2 className="mb-2 text-[16px] font-bold">About this item</h2>
              <ul className="list-disc space-y-1 pl-5 text-[14px]">
                {bullets(product.description, product.warranty, product.returnPolicy, product.specs.Weight).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </>
          }
        />
      </div>

      <div className="space-y-8 border-t border-line px-3 py-6 sm:px-5">
        {more.length > 0 && (
          <section>
            <h2 className="mb-3 text-[21px] font-bold">Products related to this item</h2>
            <Shelf label="Products related to this item">
              {more.map((p) => (
                <div key={p.id} className="snap-start">
                  <MiniCard product={p} />
                </div>
              ))}
            </Shelf>
          </section>
        )}
        <Reviews product={product} />
      </div>
    </div>
  );
}
