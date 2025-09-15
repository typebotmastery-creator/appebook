import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Purchase } from '../../types';
import { ShoppingBag } from 'lucide-react';

export const PurchaseHistory: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*, products(name)')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico de compras:', error);
      } else if (data) {
        const formattedData = data.map((p: any) => ({
          id: p.id,
          product_name: p.products.name,
          purchase_date: p.purchase_date,
          price: p.price,
          status: p.status,
        }));
        setPurchases(formattedData);
      }
      setLoading(false);
    };

    fetchPurchases();
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Histórico de Compras</h2>
      <p className="text-gray-600 mb-6">Veja todas as suas compras realizadas na loja.</p>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando histórico...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Nenhuma compra encontrada</h3>
          <p className="text-gray-500">Você ainda não fez nenhuma compra na loja.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Produto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchases.map(purchase => (
                <tr key={purchase.id}>
                  <td className="py-4 px-4 text-sm text-gray-800">{purchase.product_name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{new Date(purchase.purchase_date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-4 px-4 text-sm text-gray-800 font-medium">{formatPrice(purchase.price)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(purchase.status)}`}>
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
