
import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

// Always run this endpoint on request rather than generating
// one enormous response during deployment.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;

		const pageInput = Number(searchParams.get('page') ?? '1');
		const page = Number.isSafeInteger(pageInput) && pageInput > 0
			? Math.min(pageInput, 1000000)
			: 1;

		const limit = 50;
		const offset = (page - 1) * limit;

		const query = `
			WITH ObjectTags AS (
				SELECT
					data_id,
					version,
					tag,
					ROW_NUMBER() OVER (
						PARTITION BY data_id, version
						ORDER BY tag
					) AS rn
				FROM tags
				WHERE tag LIKE 'UL_C%' OR tag LIKE 'DL_C%'
			)
			SELECT
				objects.data_id,
				objects.version,
				SUBSTR(objects.name, 1, INSTR(objects.name, '@') - 1) AS name,
				SUBSTR(objects.name, INSTR(objects.name, '@') + 1) AS uploader,
				objects.create_time_standard AS creation_time,
				objects.update_time_standard AS update_time,
				objects.referred_time_standard AS last_visit_time,
				objects.referred_count AS visits,
				CAST(SUBSTR(ObjectTags.tag, INSTR(ObjectTags.tag, '_') + 2) AS INTEGER) AS country_id
			FROM objects
			LEFT JOIN ObjectTags
				ON objects.data_id = ObjectTags.data_id
				AND objects.version = ObjectTags.version
				AND ObjectTags.rn = 1
			ORDER BY objects.data_id, objects.version
			LIMIT ? OFFSET ?
		`;

		const towns = database.prepare(query).all(limit, offset);

		return NextResponse.json({
			towns,
			page,
			hasMore: towns.length === limit
		});
	} catch (error) {
		console.error('Error loading towns:', error);

		return NextResponse.json(
			{ error: 'Failed to load towns' },
			{ status: 500 }
		);
	}
}
