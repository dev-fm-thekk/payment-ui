'use client'

import { useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useOrganisation } from '@/contexts/OrganisationContext';

export default function OrgDashboard() {
	const params = useParams();
	const { user } = useUser();
	const { getOrganisationById } = useOrganisation();
	const orgId = params?.id as string;
	const org = getOrganisationById(orgId);

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-1">{org?.name || orgId}</h1>
			<p className="text-neutral-500">Welcome back, {user.name || user.email}</p>
		</div>
	);
}

