import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetDto } from 'shared/dto';
import { AssetStatus } from 'shared/enums';

import { useAssets } from '../hooks/useAssets';

export const AssetList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, unknown>>({ page: 1, limit: 10 });
  const { data, isLoading } = useAssets(filters);

  const assets = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
        <button
          onClick={() => navigate('/assets/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Asset
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or tag..."
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <select
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {assets.map((asset: AssetDto) => (
              <li key={asset.id}>
                <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">{asset.name}</p>
                    <p className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="truncate">{asset.assetTag}</span>
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center gap-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {asset.status}
                    </span>
                    <button
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/assets/${asset.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
