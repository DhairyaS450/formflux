'use client';

const teamMembers = [
	{
		name: "Ishaan Dhiman",
		overview:
			"Hi, I’m Ishaan, a Grade 10 student passionate about coding, web development, and problem-solving. I’m exploring backend development and love working with React, Next.js, Tailwind CSS, Supabase, and Vercel. When I’m not coding, I’m playing soccer, biking, or building creative projects.",
		website: "https://ishaan-dhiman.vercel.app/",
	},
	{
		name: "Dhairya Shah",
		overview:
			"I build fast, accessible digital experiences with a focus on full-stack and AI-driven solutions. Skilled in Next.js and Supabase, I designed and developed this entire website myself.",
		website: "https://dhairyashah.work/",
	},
	{
		name: "Rohan Tewari",
		overview:
			"I’m Rohan, a Grade 10 student passionate about web development and teaching. I code in HTML, CSS, JavaScript, and Python, and also work as a lifeguard and swim instructor, gaining leadership and communication skills along the way.",
		website: null,
	},
	{
		name: "Atharv Gokule",
		overview:
			"I’m Atharv, a software developer with a passion for competitive programming, algorithms, and building smart, practical solutions. I’m always up for a challenge and love learning new things in computer science.",
		website: "https://www.theatharv.co/",
	},
];

export default function Team() {
	return (
		<section className="bg-black text-white py-16 sm:py-24 min-h-screen">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl mb-12">
					Meet the Team
				</h2>
				<div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
					{teamMembers.map((member) => (
						<div
							key={member.name}
							className="bg-slate-900 p-8 rounded-lg shadow-lg flex flex-col justify-between h-full"
						>
							<div>
								<h3 className="text-xl font-semibold text-white mb-4">
									{member.name}
								</h3>
								<p className="text-gray-400 mb-6">{member.overview}</p>
							</div>
							<div>
								{member.website ? (
									<a
										href={member.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-400 hover:text-blue-300 transition-colors"
									>
										Website
									</a>
								) : (
									<p className="text-gray-500">Coming Soon</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
