'use client'

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import {fetchServices} from '@/services/company-service';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CreateServiceDialog from '@/components/services/add-service-dialog';
import Link from 'next/link';

type Service = {
	id: string,
	name: string, 
	companyId: string,
	currency: string,
};

type ServiceCardProps = {
     service: Service
}

const ServiceCard = ({ service }: ServiceCardProps) => {
	return (
		<Card className='w-64 px-4 py-3'>
			<CardTitle>{service.name}</CardTitle>
			<CardDescription>Click to go to {service.name} service</CardDescription>
			<Link href={`/app/${service.companyId}/services/${service.id}/provider`}>
				<Button>Provider</Button>
			</Link>
		</Card>
	);
}

export default function Services() {
	const [services, setServices] = useState([]);
	const [error, setError] = useState(false);

	const params = useParams();
	
	const companyId = params?.id as string; 
	useEffect(() => {
		fetchServices(companyId).then(data => {
			console.log(data);
			if (data.status === "failed") {
				setError(true);
				console.log(data.reason);
			};
			if (data.data && data.data.length > 0) setServices(data.data);
		})
	}, [services]);
	
	console.log(services);

	return services.length === 0 ? (
		<div className='w-full h-[90dvh] flex justify-center items-center align-center'>
			<div className='w-200 h-120 border border-dotted border-black flex justify-center items-center rounded-xl'>
				<CreateServiceDialog companyId={companyId}/>
			</div>
		</div>
	) :  (!error) ? (
	        <div className='flex justify-center items-center flex-col'>
				<div className='flex justify-between items-center w-full px-4 py-3'>
					<h1 className='text-xl'>services: {services.length}</h1>
					<CreateServiceDialog companyId={companyId}/>
				</div>
				
				<div className='w-full px-4 py-3 grid grid-cols-4 gap-2'>
					{services.map((item, idx) => {
						return <ServiceCard service={item} key={idx} />
					})}
				</div>
			</div>
	): (
		<p>Something Went wrong</p>
	)
}
