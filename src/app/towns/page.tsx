
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { countryIDToClassName } from '@/lib/utils';
import '@/app/towns/page.css';
import '/node_modules/flag-icons/css/flag-icons.min.css';

type TownBasic = {
	data_id: number;
	version: number;
	name: string;
	uploader: string;
	creation_time: string;
	update_time: string;
	last_visit_time: string;
	visits: number;
	country_id: number;
};

const columns: ColumnDef<TownBasic>[] = [
	{
		accessorKey: 'data_id',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() =>
					column.toggleSorting(
						column.getIsSorted() === 'asc'
					)
				}
			>
				Data ID
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		)
	},
	{
		accessorKey: 'version',
		header: 'Version'
	},
	{
		accessorKey: 'name',
		header: 'Name'
	},
	{
		accessorKey: 'uploader',
		header: 'Uploader'
	},
	{
		accessorKey: 'creation_time',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() =>
					column.toggleSorting(
						column.getIsSorted() === 'asc'
					)
				}
			>
				Created
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		)
	},
	{
		accessorKey: 'update_time',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() =>
					column.toggleSorting(
						column.getIsSorted() === 'asc'
					)
				}
			>
				Updated
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		)
	},
	{
		accessorKey: 'last_visit_time',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() =>
					column.toggleSorting(
						column.getIsSorted() === 'asc'
					)
				}
			>
				Last Visit
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		)
	},
	{
		accessorKey: 'visits',
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() =>
					column.toggleSorting(
						column.getIsSorted() === 'asc'
					)
				}
			>
				Visits
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		)
	},
	{
		accessorKey: 'country_id',
		header: 'Country',
		cell: ({ row }) => {
			const countryID = Number(
				row.getValue('country_id')
			);

			return (
				<span
					className={countryIDToClassName(countryID)}
				/>
			);
		}
	},
	{
		id: 'details_link',
		header: '',
		cell: ({ row }) => {
			const { data_id, version } = row.original;

			return (
				<Button asChild>
					<Link href={`/town/${data_id}/${version}`}>
						Details
					</Link>
				</Button>
			);
		}
	},
	{
		id: 'download_link',
		header: '',
		cell: ({ row }) => {
			const { data_id, version } = row.original;

			const href =
				`https://r2-acnl-public.pretendo.network/objects/${data_id}_v${version}.bin`;

			return (
				<Button asChild>
					<Link href={href} target="_blank">
						Download
					</Link>
				</Button>
			);
		}
	}
];

export default function TownsPage() {
	const [data, setData] = useState<TownBasic[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [name, setName] = useState('');
	const [uploader, setUploader] = useState('');
	const [dataID, setDataID] = useState('');

	const [search, setSearch] = useState({
		name: '',
		uploader: '',
		dataID: ''
	});

	const applySearch = () => {
		setPage(1);
		setSearch({ name, uploader, dataID });
	};

	const clearSearch = () => {
		setName('');
		setUploader('');
		setDataID('');
		setPage(1);
		setSearch({
			name: '',
			uploader: '',
			dataID: ''
		});
	};

	useEffect(() => {
		const controller = new AbortController();

		async function loadTowns() {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams({
				page: String(page)
			});

			if (search.name) {
				params.set('name', search.name);
			}

			if (search.uploader) {
				params.set('uploader', search.uploader);
			}

			if (search.dataID) {
				params.set('data_id', search.dataID);
			}

			try {
				const response = await fetch(
					`/api/towns?${params.toString()}`,
					{ signal: controller.signal }
				);

				if (!response.ok) {
					throw new Error(
						`Server error: ${response.status}`
					);
				}

				const result = await response.json();

				if (!Array.isArray(result.towns)) {
					throw new Error(
						'Invalid response from archive'
					);
				}

				setData(result.towns);
				setHasMore(result.hasMore);
			} catch (err) {
				if (controller.signal.aborted) {
					return;
				}

				setError(
					err instanceof Error
						? err.message
						: 'Unable to load towns'
				);
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			}
		}

		loadTowns();

		return () => controller.abort();
	}, [page, search]);

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-2xl font-bold mb-4">
				Animal Crossing: New Leaf Town Archive
			</h1>

			<p className="mb-6">
				Search and browse archived Animal Crossing towns.
			</p>

			<form
				className="flex flex-wrap gap-3 mb-6"
				onSubmit={(event) => {
					event.preventDefault();
					applySearch();
				}}
			>
				<input
					className="border rounded p-2"
					placeholder="Town name"
					aria-label="Town name"
					value={name}
					onChange={(e) =>
						setName(e.target.value)
					}
				/>

				<input
					className="border rounded p-2"
					placeholder="Uploader"
					aria-label="Uploader"
					value={uploader}
					onChange={(e) =>
						setUploader(e.target.value)
					}
				/>

				<input
					className="border rounded p-2"
					placeholder="Data ID"
					aria-label="Data ID"
					value={dataID}
					onChange={(e) =>
						setDataID(e.target.value)
					}
				/>

				<Button type="submit">
					Search Archive
				</Button>

				<Button
					type="button"
					variant="outline"
					onClick={clearSearch}
				>
					Clear
				</Button>
			</form>

			{isLoading ? (
				<p>Searching archive...</p>
			) : error ? (
				<p className="text-red-500">
					Error: {error}
				</p>
			) : (
				<>
					{data.length > 0 ? (
						<DataTable
							columns={columns}
							data={data}
						/>
					) : (
						<p>No matching towns found.</p>
					)}

					<div className="flex gap-4 mt-6 items-center">
						<Button
							variant="outline"
							disabled={page === 1}
							onClick={() =>
								setPage(p =>
									Math.max(1, p - 1)
								)
							}
						>
							Previous 50
						</Button>

						<span>Page {page}</span>

						<Button
							disabled={!hasMore}
							onClick={() =>
								setPage(p => p + 1)
							}
						>
							Next 50
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
