import React from 'react';
import { Github, Linkedin, Briefcase } from 'lucide-react';
import { GlassmorphismProfileCard, SocialLink } from '../components/ui/profile-card-1';

const More = () => {
  const authors = [
    {
      id: 1,
      name: 'Ganesh Kantle',
      title: 'AI Web Developer',
      // bio: 'Passionate about building scalable web applications and AI-powered solutions. Expertise in React, Node.js, and machine learning.',
      avatarUrl: 'https://res.cloudinary.com/dqkhdusc4/image/upload/v1764004865/boy_hroyaw.png',
      socialLinks: [
        { id: 'github', icon: Github, label: 'GitHub', href: 'https://github.com/ganeshkantle' },
        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/ganesh-kantle' },
        { id: 'portfolio', icon: Briefcase, label: 'Portfolio', href: 'https://ganesh-kantle.vercel.app' },
      ] as SocialLink[],
      actionButton: {
        text: 'Contact',
        href: 'mailto:ganeshkantle@gmail.com',
      },
    },
    {
      id: 2,
      name: 'Manju A R',
      title: 'UI/UX Designer & Frontend Developer',
      // bio: 'Creating beautiful and intuitive user experiences. Specialized in modern design systems, accessibility, and responsive interfaces.',
      avatarUrl: 'https://res.cloudinary.com/dqkhdusc4/image/upload/v1764004865/user_qddras.png',
      socialLinks: [
        { id: 'github', icon: Github, label: 'GitHub', href: 'https://github.com/MANJU-AR' },
        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/manju-a-r-624466255' },
        { id: 'portfolio', icon: Briefcase, label: 'Portfolio', href: 'https://github.com/MANJU-AR' },
      ] as SocialLink[],
      actionButton: {
        text: 'Contact',
        href: 'mailto:manjuaraug2k2@gmail.com',
      },
    },
    {
      id: 3,
      name: 'Nagashree Uday Bhat',
      title: 'Backend Engineer & AI Specialist',
      // bio: 'Building robust APIs and machine learning models. Focused on performance optimization and scalable architecture.',
      avatarUrl: 'https://res.cloudinary.com/dqkhdusc4/image/upload/v1764004865/human_f1qari.png',
      socialLinks: [
        { id: 'github', icon: Github, label: 'GitHub', href: 'https://github.com/NagashreeBhat04' },
        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/nagashree-bhat-694774256' },
        { id: 'portfolio', icon: Briefcase, label: 'Portfolio', href: 'https://github.com/NagashreeBhat04' },
      ] as SocialLink[],
      actionButton: {
        text: 'Contact',
        href: 'mailto:bhatnagashree1@gmail.com',
      },
    },
    {
      id: 4,
      name: 'Nandita Karuna',
      title: 'DevOps Engineer & Security Expert',
      // bio: 'Ensuring secure, reliable deployments and infrastructure. Passionate about automation, cloud computing, and system security.',
      avatarUrl: 'https://res.cloudinary.com/dqkhdusc4/image/upload/v1764004865/woman_dczty3.png',
      socialLinks: [
        { id: 'github', icon: Github, label: 'GitHub', href: 'https://github.com' },
        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
        { id: 'portfolio', icon: Briefcase, label: 'Portfolio', href: 'https://twitter.com' },
      ] as SocialLink[],
      actionButton: {
        text: 'Contact',
        href: 'mailto:emma@example.com',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-9xl 3xl:max-w-[140rem] mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-4 xs:py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 2xl:py-20 3xl:py-24">
        
        {/* Authors Section */}
        <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 xs:mb-6 sm:mb-8 text-center">
            Project Authors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16 items-stretch">
            {authors.map((author) => (
              <GlassmorphismProfileCard
                key={author.id}
                avatarUrl={author.avatarUrl}
                name={author.name}
                title={author.title}
                // bio={author.bio}
                socialLinks={author.socialLinks}
                actionButton={author.actionButton}
              />
            ))}
          </div>
        </section>

        {/* Development Tools Section */}
        <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 xs:mb-8 sm:mb-10 md:mb-12 text-center">
            Development Tools
          </h2>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3 xs:gap-3.5 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cursor.svg"
              name="Cursor"
              category="IDE"
              gradient="from-purple-600 via-indigo-600 to-purple-700"
              bgGradient="from-purple-50 to-indigo-50"
              iconColor="#000000"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/visualstudiocode.svg"
              name="VSCode"
              category="IDE"
              gradient="from-blue-500 via-blue-600 to-cyan-600"
              bgGradient="from-blue-50 to-cyan-50"
              iconColor="#007ACC"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg"
              name="ChatGPT"
              category="AI Assistant"
              gradient="from-emerald-500 via-green-500 to-teal-500"
              bgGradient="from-emerald-50 to-teal-50"
              iconColor="#10A37F"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cloudinary.svg"
              name="Cloudinary"
              category="Cloud Storage"
              gradient="from-sky-500 via-blue-500 to-cyan-500"
              bgGradient="from-sky-50 to-cyan-50"
              iconColor="#3448C5"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vercel.svg"
              name="Vercel"
              category="Hosting"
              gradient="from-gray-900 via-gray-800 to-black"
              bgGradient="from-gray-50 to-gray-100"
              iconColor="#000000"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/render.svg"
              name="Render"
              category="Hosting"
              gradient="from-emerald-600 via-teal-600 to-cyan-600"
              bgGradient="from-emerald-50 to-teal-50"
              iconColor="#46E3B7"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlecolab.svg"
              name="Google Colab"
              category="Jupyter Notebook"
              gradient="from-orange-500 via-amber-500 to-yellow-500"
              bgGradient="from-orange-50 to-yellow-50"
              iconColor="#F9AB00"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftexcel.svg"
              name="Excel"
              category="Spreadsheet"
              gradient="from-green-600 via-emerald-600 to-teal-600"
              bgGradient="from-green-50 to-emerald-50"
              iconColor="#217346"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ieee.svg"
              name="IEEE"
              category="Research Database"
              gradient="from-red-500 via-orange-500 to-amber-500"
              bgGradient="from-red-50 to-orange-50"
              iconColor="#00629B"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

// Tech Card Component
interface TechCardProps {
  iconUrl: string;
  name: string;
  category: string;
  gradient: string;
  bgGradient: string;
  iconColor: string;
}

const TechCard = React.memo<TechCardProps>(({ iconUrl, name, category, gradient, bgGradient, iconColor }) => (
  <div className="group relative w-full h-full">
    <div className={`absolute -inset-0.5 bg-gradient-to-br ${gradient} rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`} />
    <div className={`relative w-full h-full rounded-lg bg-gradient-to-br ${bgGradient} backdrop-blur-sm border border-white/60 p-3 shadow-md hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5`}>
      <div className="flex flex-col items-center justify-between h-full">
        <div className="w-10 h-10 mb-2.5 rounded-lg bg-white/95 backdrop-blur-md border border-white/70 shadow-md group-hover:shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 overflow-hidden p-2 flex-shrink-0">
          <img 
            src={iconUrl} 
            alt={`${name} icon`}
            className="w-full h-full object-contain"
            style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.1))` }}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}"><circle cx="12" cy="12" r="10"/></svg>`)}`;
            }}
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full flex-1 min-h-[2.5rem]">
          <h3 className="text-xs font-bold text-gray-900 mb-0.5 leading-tight text-center line-clamp-2">{name}</h3>
          <p className="text-[10px] text-gray-600 font-medium text-center line-clamp-1">{category}</p>
        </div>
      </div>
    </div>
  </div>
));

TechCard.displayName = 'TechCard';

export default More;
