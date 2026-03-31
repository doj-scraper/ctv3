"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  brand: string;
  model: string;
  primaryDeviceLabel: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function SearchModal({ isOpen, onClose, initialQuery = "" }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Search function
  const searchParts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/parts?search=${encodeURIComponent(searchQuery)}`);
      const data: { success?: boolean; parts?: SearchResult[] } = await response.json();

      if (data.success && data.parts) {
        setResults(data.parts.slice(0, 6));
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchParts(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchParts]);

  // Handle submit - redirect to catalog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(`/catalog?search=${encodeURIComponent(result.sku)}`);
    onClose();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById("search-modal-input") as HTMLInputElement;
      input?.focus();
      if (initialQuery) {
        setQuery(initialQuery);
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ct-bg/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-ct-bg-secondary rounded-[1.4rem] border border-ct-text-secondary/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <form onSubmit={handleSubmit} className="relative border-b border-ct-text-secondary/10">
          <div className="flex items-center px-4">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-ct-text-secondary animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-ct-text-secondary" />
            )}
            <input
              id="search-modal-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by SKU, model, or part type..."
              className="flex-1 bg-transparent px-4 py-5 text-lg text-ct-text placeholder:text-ct-text-secondary/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-ct-text-secondary hover:text-ct-text transition-colors rounded-lg hover:bg-ct-text-secondary/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {hasSearched && !isLoading && results.length === 0 && (
            <div className="p-8 text-center text-ct-text-secondary">
              <p>No results found for &quot;{query}&quot;</p>
              <p className="text-sm mt-2 text-ct-text-secondary/60">
                Try searching for a different term or browse the catalog
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-ct-bg transition-colors group text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ct-text truncate">
                        {result.name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full",
                          result.stock > 0
                            ? "bg-ct-accent/10 text-ct-accent"
                            : "bg-red-500/10 text-red-400"
                        )}
                      >
                        {result.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-micro text-ct-text-secondary">{result.sku}</span>
                      <span className="text-ct-text-secondary/30">•</span>
                      <span className="text-micro text-ct-text-secondary">{result.primaryDeviceLabel}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ct-accent">
                      ${(result.price / 100).toFixed(2)}
                    </div>
                    <ArrowRight className="w-4 h-4 text-ct-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {!hasSearched && (
            <div className="p-4">
              <div className="text-micro text-ct-text-secondary mb-3">Quick Searches</div>
              <div className="flex flex-wrap gap-2">
                {["iPhone 15", "Galaxy S24", "Display Assembly", "Battery"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-lg bg-ct-bg border border-ct-text-secondary/10 text-sm text-ct-text-secondary hover:border-ct-accent/30 hover:text-ct-text transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-ct-text-secondary/10 bg-ct-bg/50">
          <div className="flex items-center gap-4 text-micro text-ct-text-secondary/60">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-ct-bg-secondary border border-ct-text-secondary/10">Enter</kbd>
              <span>to search</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-ct-bg-secondary border border-ct-text-secondary/10">Esc</kbd>
              <span>to close</span>
            </span>
          </div>
          <button
            onClick={() => {
              router.push("/catalog");
              onClose();
            }}
            className="text-micro text-ct-accent hover:text-ct-accent/80 transition-colors"
          >
            Browse full catalog →
          </button>
        </div>
      </div>
    </div>
  );
}
