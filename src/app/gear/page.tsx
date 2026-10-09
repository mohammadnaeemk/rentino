"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { GearCard } from "@/components/gear/gear-card";
import { api, ApiRequestError } from "@/lib/api";
import { toGearItem, type ApiGear } from "@/lib/gear";
import type { Category, GearItem } from "@/types";

const PAGE_SIZE = 6;

type SortKey = "recommended" | "price-asc" | "price-desc" | "rating";

interface GearResponse {
  success: boolean;
  message: string;
  data: ApiGear[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export default function GearListingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState<GearItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState<SortKey>("recommended");

  const [page, setPage] = useState(1);

  // --------------------------------------------------
  // Fetch gear + categories
  // --------------------------------------------------

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [gearResponse, categoryResponse] = await Promise.all([
          api.get<GearResponse>("/gear?limit=100", {
            auth: false,
          }),

          api.get<CategoryResponse>("/categories", {
            auth: false,
          }),
        ]);

        // -----------------------------
        // Gear response
        // -----------------------------

        if (!gearResponse || !Array.isArray(gearResponse.data)) {
          throw new Error("Invalid gear response from server.");
        }

        const mappedGear = gearResponse.data.map(toGearItem);

        setItems(mappedGear);

        // -----------------------------
        // Category response
        // -----------------------------

        if (categoryResponse && Array.isArray(categoryResponse.data)) {
          setCategories(categoryResponse.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to load gear:", error);

        setItems([]);
        setCategories([]);

        if (error instanceof ApiRequestError) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Could not load gear.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  // --------------------------------------------------
  // Category
  // --------------------------------------------------

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  // --------------------------------------------------
  // Price
  // --------------------------------------------------

  function handlePriceChange(value: string) {
    setPriceRange(value);
    setPage(1);
  }

  // --------------------------------------------------
  // Sort
  // --------------------------------------------------

  function handleSortChange(value: SortKey) {
    setSort(value);
    setPage(1);
  }

  // --------------------------------------------------
  // Clear filters
  // --------------------------------------------------

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setPriceRange("all");
    setSort("recommended");
    setPage(1);
  }

  // --------------------------------------------------
  // Filter + sort
  // --------------------------------------------------

  const filtered = useMemo(() => {
    let result = [...items];

    // Search
    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter((gear) => {
        const title = gear.title?.toLowerCase() ?? "";

        const brand = gear.brand?.toLowerCase() ?? "";

        const description = gear.description?.toLowerCase() ?? "";

        return (
          title.includes(searchTerm) ||
          brand.includes(searchTerm) ||
          description.includes(searchTerm)
        );
      });
    }

    // Category
    if (category !== "all") {
      result = result.filter((gear) => gear.category?.slug === category);
    }

    // Price
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);

      result = result.filter((gear) => {
        const price = Number(gear.pricePerDay ?? 0);

        if (max) {
          return price >= min && price <= max;
        }

        return price >= min;
      });
    }

    // Sort
    switch (sort) {
      case "price-asc":
        result.sort(
          (a, b) => Number(a.pricePerDay ?? 0) - Number(b.pricePerDay ?? 0),
        );
        break;

      case "price-desc":
        result.sort(
          (a, b) => Number(b.pricePerDay ?? 0) - Number(a.pricePerDay ?? 0),
        );
        break;

      case "rating":
        result.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
        break;

      case "recommended":
      default:
        break;
    }

    return result;
  }, [items, search, category, priceRange, sort]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            Browse gear
          </h1>

          <p className="mt-1 text-sm text-muted">
            {loading
              ? "Loading gear..."
              : `${filtered.length} listings match your filters.`}
          </p>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <Input
              placeholder="Search by gear name or brand..."
              className="pl-9"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Search gear"
            />
          </div>

          {/* Category */}
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>

              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price */}
          <Select value={priceRange} onValueChange={handlePriceChange}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Any price</SelectItem>

              <SelectItem value="0-30">Under $30/day</SelectItem>

              <SelectItem value="30-60">$30–$60/day</SelectItem>

              <SelectItem value="60-1000">$60+/day</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sort}
            onValueChange={(value) => handleSortChange(value as SortKey)}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>

              <SelectItem value="price-asc">Price: low to high</SelectItem>

              <SelectItem value="price-desc">Price: high to low</SelectItem>

              <SelectItem value="rating">Top rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gear grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            : paged.map((gear) => <GearCard key={gear.id} gear={gear} />)}
        </div>

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold">No gear found</h2>

            <p className="mt-2 max-w-md text-sm text-muted">
              No gear matches those filters yet. Try changing your search or
              filters.
            </p>

            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <span className="px-2 text-sm text-muted">
              Page {safePage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
