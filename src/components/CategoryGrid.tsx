import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProductCategory, CategoryItem } from '../types';
import { INITIAL_CATEGORIES } from '../data/mockData';

interface CategoryGridProps {
  onSelectCategory: (category: ProductCategory) => void;
  categories?: CategoryItem[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  categories = INITIAL_CATEGORIES,
}) => {
  const displayCategories = categories.filter((c) => c.featured !== false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-[#A37F37] font-semibold">
          Curated Design Universes
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 mt-2">
          Shop By Category
        </h2>
        <div className="w-12 h-0.5 bg-[#C5A059] mx-auto mt-3" />
        <p className="text-stone-600 text-sm mt-3 font-light">
          Discover our signature aesthetic blending ancestral Pakistani craft with contemporary haute couture silhouettes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`group relative h-80 sm:h-96 rounded-md overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-[#EBDCCB] ${cat.span || ''}`}
          >
            {/* Background Image */}
            <img
              src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
              alt={cat.name}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Dark/Warm gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors" />

            {/* Top Badge */}
            {cat.itemCount && (
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 rounded bg-black/40 backdrop-blur-md text-[11px] font-medium text-white/90 border border-white/20">
                  {cat.itemCount}
                </span>
              </div>
            )}

            {/* Bottom Content */}
            <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-[#DFCA95] uppercase tracking-wider font-medium">
                  {cat.subtitle || 'Artisanal Luxury'}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1 group-hover:text-[#DFCA95] transition-colors">
                  {cat.name}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#C5A059] backdrop-blur-md flex items-center justify-center text-white group-hover:text-stone-950 transition-all">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
