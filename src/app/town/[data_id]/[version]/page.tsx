
'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { countryIDToClassName } from '@/lib/utils';
import '/node_modules/flag-icons/css/flag-icons.min.css'; // TODO - This import sucks. Change it

type Town = {
	data_id: number;
	version: number;
	name: string;
	uploader: string;
	creation_time: string;
	update_time: string;
	last_visit_time: string;
	visits: number;
	country_id: number;
	villagers: string[];
	versions: number[];
}

export default function TownPage() {
	const params = useParams<{
		data_id: string;
		version: string
	}>();

	const [data, setData] = useState<Town | { error: string; } | null>(null);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);

		fetch(`/api/towns/${params.data_id}/${params.version}`)
			.then((res) => res.json())
			.then((data) => {
				setData(data);
				setLoading(false);
			})
			.catch(() => {
				setData({ error: 'Failed to load town data' });
				setLoading(false);
			});
	}, [params.data_id, params.version]);

	if (isLoading) {
		// TODO - Add a loader
		return <p>Loading...</p>
	}

	if (!data) {
		// TODO - Better error
		return <p>No town to display</p>
	}

	if ('error' in data) {
		return <p>{data.error}</p>
	}

	// TODO - Implement this page

	return (
		<div className="container mx-auto py-10">
			<h1>Town: {data.name}</h1>
			<h3>Uploader: {data.uploader} <span className={countryIDToClassName(data.country_id)}></span></h3>
			<h3>Date Uploaded: {data.creation_time}</h3>
			<h3>Date Updated: {data.update_time}</h3>
			<h3>Last Visit: {data.last_visit_time}</h3>
			<h3>Visits: {data.visits}</h3>
			<h3>Villagers:</h3>
			<ol>
				{data.villagers.map((villager, index) => (
					<li key={`${villager}-${index}`}> - {villager}</li>
				))}
			</ol>
			<h3>Versions:</h3>
			<ol>
				{data.versions.map((version, index) => (
					<li key={`${version}-${index}`}> - {version}</li>
				))}
			</ol>
		</div>
	)
}
