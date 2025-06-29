import { useLazyProducts } from '@/hooks/useLazyProducts';
import { ProductSelector } from '@/components/ProductSelector'; // your selector
import { useState } from 'react';

const ProductList = () => {
  const {
    products,
    fetchProducts,
    hasMore,
    loading
  } = useLazyProducts();

  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const scrollToProduct = async (productId: string) => {
    let found = false;
    let page = 0;

    while (!found && hasMore) {
      const { data } = await fetchProducts(page);
      if (data.find(p => p.id === productId)) {
        found = true;
      }
      page++;
    }

    setTimeout(() => {
      const el = document.getElementById(`product-${productId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    scrollToProduct(productId); // ← triggers auto-scroll in main list
  };

  return (
    <>
      <ProductSelector
        products={products}
        selectedProductId={selectedProductId}
        onProductSelect={handleProductSelect}
        open={/* your state */}
        onOpenChange={/* your setter */}
      />

      <div className="space-y-2 mt-4">
        {products.map((product) => (
          <div
            key={product.id}
            id={`product-${product.id}`} // for scrolling
            className="p-2 border rounded"
          >
            <strong>{product.name}</strong> — {product.sku}
          </div>
        ))}

        {loading && <p className="text-center">Loading more...</p>}
        {!hasMore && <p className="text-center text-gray-400">No more products.</p>}
      </div>
    </>
  );
};
