/*eslint-disable*/
import React from 'react';
import { Github, Linkedin, Briefcase, ExternalLink, FileText, BookOpen, FileSpreadsheet, Youtube, Play, Presentation } from 'lucide-react';
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
        // { id: 'portfolio', icon: Briefcase, label: 'Portfolio', href: 'https://ganesh-kantle.vercel.app' },
      ] as SocialLink[],
      actionButton: {
        text: 'Contact',
        href: 'mailto:ganeshkantle@gmail.com',
      },
    },
    {
      id: 2,
      name: 'Manju A R',
      title: 'AI/ML Engineer',
      // bio: 'Creating beautiful and intuitive user experiences. Specialized in modern design systems, accessibility, and responsive interfaces.',
      avatarUrl: 'https://res.cloudinary.com/dqkhdusc4/image/upload/v1764004865/user_qddras.png',
      socialLinks: [
        { id: 'github', icon: Github, label: 'GitHub', href: 'https://github.com/MANJU-AR' },
        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/manju-a-r-624466255' },
        // { id: 'portfolio', icon: Briefcase, label: 'Portfolio', href: 'https://github.com/MANJU-AR' },
      ] as SocialLink[],
      actionButton: {
        text: 'Contact',
        href: 'mailto:manju17aug2k4@gmail.com',
      },
    },
    {
      id: 3,
      name: 'Nagashree Uday Bhat',
      title: 'Data Scientist',
      // bio: 'Building robust APIs and machine learning models. Focused on performance optimization and scalable architecture.',
      avatarUrl: 'https://res.cloudinary.com/dqkhdusc4/image/upload/v1764004865/human_f1qari.png',
      socialLinks: [
        { id: 'github', icon: Github, label: 'GitHub', href: 'https://github.com/NagashreeBhat04' },
        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/nagashree-bhat-694774256' },
        // { id: 'portfolio', icon: Briefcase, label: 'Portfolio', href: 'https://github.com/NagashreeBhat04' },
      ] as SocialLink[],
      actionButton: {
        text: 'Contact',
        href: 'mailto:bhatnagashree1@gmail.com',
      },
    },
    {
      id: 4,
      name: 'Nandita Karuna',
      title: 'Full Stack Developer',
      // bio: 'Ensuring secure, reliable deployments and infrastructure. Passionate about automation, cloud computing, and system security.',
      avatarUrl: 'https://res.cloudinary.com/dqkhdusc4/image/upload/v1764004865/woman_dczty3.png',
      socialLinks: [
        { id: 'github', icon: Github, label: 'GitHub', href: 'https://github.com/nanditha04K' },
        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/nanditha-karuna1' },
        // { id: 'portfolio', icon: Briefcase, label: 'Portfolio', href: 'https://twitter.com' },
      ] as SocialLink[],
      actionButton: {
        text: 'Contact',
        href: 'mailto:nandithakaruna1@gmail.com',
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
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-6 xl:gap-8 items-stretch max-w-5xl mx-auto">
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

        {/* Demo Video Section */}
        <section className="mb-6 xs:mb-8 sm:mb-10 md:mb-12">
          <div className="max-w-2xl mx-auto">
            <a
              href="https://youtu.be/W5s8daeX4dw"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-4 xs:p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-3 xs:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                    <Play className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white ml-0.5" fill="currentColor" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                      <Youtube className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                      <span className="text-[10px] xs:text-xs font-semibold text-white/90 uppercase tracking-wider">Watch Demo</span>
                    </div>
                    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                      Working Demo Video
                    </h3>
                    <p className="text-xs xs:text-sm text-white/90">
                      See EYE-dentify in action
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 xs:w-5 xs:h-5 text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            </a>
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
              name="IJIRCST"
              category="Research Paper"
              gradient="from-red-500 via-orange-500 to-amber-500"
              bgGradient="from-red-50 to-orange-50"
              iconColor="#00629B"
            />
            <TechCard 
              iconUrl="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/shieldcheck.svg"
              name="DrillBit"
              category="Plagiarism Detection"
              gradient="from-rose-600 via-pink-600 to-fuchsia-600"
              bgGradient="from-rose-50 to-pink-50"
              iconColor="#E91E63"
            />
          </div>
        </section>

        {/* GitHub Source Code Section */}
        <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 xs:mb-6 sm:mb-8 text-center">
            Source Code
          </h2>
          <div className="max-w-2xl mx-auto">
            <a
              href="https://github.com/GaneshKantle/EYE-dentify"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-4 xs:p-5 sm:p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-3 xs:gap-4">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <Github className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="text-sm xs:text-base sm:text-lg font-bold">View on GitHub</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-300">EYE-dentify Repository</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 xs:w-5 xs:h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>
          </div>
        </section>

        {/* Documentation Section */}
        <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 xs:mb-6 sm:mb-8 text-center">
            Documentation
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5">
            <ResourceCard icon={FileText} title="API Documentation" description="REST API endpoints & usage" href="https://github.com/GaneshKantle/EYE-dentify/blob/main/API_DOCUMENTATION.md" color="blue" />
            <ResourceCard icon={BookOpen} title="Development Guide" description="Setup & development workflow" href="https://github.com/GaneshKantle/EYE-dentify/blob/main/DEVELOPMENT_GUIDE.md" color="orange" />
            <ResourceCard icon={FileText} title="Production Deployment" description="Deploy to production" href="https://github.com/GaneshKantle/EYE-dentify/blob/main/PRODUCTION_DEPLOYMENT.md" color="purple" />
            {/* <ResourceCard icon={FileText} title="Port Configuration" description="Network & port setup" href="https://github.com/GaneshKantle/EYE-dentify/blob/main/PORT_CONFIGURATION.md" color="orange" /> */}
          </div>
        </section>

        {/* Technical Papers Section */}
        <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 xs:mb-6 sm:mb-8 text-center">
            Technical Papers
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5">
            <ResourceCard icon={BookOpen} title="FaceNet-Driven Face Recognition" description="Forensic sketch construction & matching" href="https://doi.org/10.55524/ijircst.2025.13.6.12" color="indigo" />
            <ResourceCard icon={FileText} title="Published Paper (PDF)" description="Research paper publication" href="https://drive.google.com/file/d/17HDvgAdvBZ0toX6x4eSlTzHhdk6cM4DD/view?usp=sharing" color="emerald" />
            <ResourceCard icon={Presentation} title="Project Presentation" description="Project PPT slides" href="https://docs.google.com/presentation/d/1ZZ0Pw8KFikMWSFz0RxTOMzW0UXd-ZtTh/edit?usp=sharing&ouid=104503515046523301340&rtpof=true&sd=true" color="purple" />
            {/* <ResourceCard icon={BookOpen} title="Sketch-to-Face Synthesis" description="GAN-based approach" comingSoon color="rose" /> */}
            {/* <ResourceCard icon={BookOpen} title="System Architecture" description="Technical implementation" comingSoon color="cyan" /> */}
          </div>
        </section>

        {/* Reports Section */}
        <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 xs:mb-6 sm:mb-8 text-center">
            Project Reports
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5">
            <ResourceCard icon={FileSpreadsheet} title="Plagiarism Report" description="DrillBit plagiarism detection" href="https://drive.google.com/file/d/1cSo7Aej9MUyjBVeAswArut2WZYIMaEQu/view?usp=sharing" color="rose" />
            <ResourceCard icon={FileSpreadsheet} title="Final Report (PDF)" description="Complete documentation" href="https://drive.google.com/file/d/1-44AUw1udgvjhzaRRhR9cAahMA8kgXVd/view?usp=sharing" color="violet" />
            <ResourceCard icon={FileSpreadsheet} title="Final Report (DOC)" description="Complete documentation" href="https://docs.google.com/document/d/1eVPFk9HBfg9iuBbn5mYbaJz0_bhz2FF1/edit?usp=sharing&ouid=104503515046523301340&rtpof=true&sd=true" color="indigo" />
            {/* <ResourceCard icon={FileSpreadsheet} title="Project Synopsis" description="Overview & objectives" comingSoon color="amber" /> */}
                 {/* <ResourceCard icon={FileSpreadsheet} title="Progress Report" description="Development milestones" comingSoon color="teal" /> */}
          </div>
        </section>
      </div>
    </div>
  );
};

// Resource Card Component
interface ResourceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  comingSoon?: boolean;
  color: 'blue' | 'emerald' | 'purple' | 'orange' | 'indigo' | 'rose' | 'cyan' | 'amber' | 'teal' | 'violet';
}

const colorMap = {
  blue: { bg: 'from-blue-50 to-sky-50', icon: 'bg-blue-100 text-blue-600', border: 'hover:border-blue-200' },
  emerald: { bg: 'from-emerald-50 to-green-50', icon: 'bg-emerald-100 text-emerald-600', border: 'hover:border-emerald-200' },
  purple: { bg: 'from-purple-50 to-violet-50', icon: 'bg-purple-100 text-purple-600', border: 'hover:border-purple-200' },
  orange: { bg: 'from-orange-50 to-amber-50', icon: 'bg-orange-100 text-orange-600', border: 'hover:border-orange-200' },
  indigo: { bg: 'from-indigo-50 to-blue-50', icon: 'bg-indigo-100 text-indigo-600', border: 'hover:border-indigo-200' },
  rose: { bg: 'from-rose-50 to-pink-50', icon: 'bg-rose-100 text-rose-600', border: 'hover:border-rose-200' },
  cyan: { bg: 'from-cyan-50 to-sky-50', icon: 'bg-cyan-100 text-cyan-600', border: 'hover:border-cyan-200' },
  amber: { bg: 'from-amber-50 to-yellow-50', icon: 'bg-amber-100 text-amber-600', border: 'hover:border-amber-200' },
  teal: { bg: 'from-teal-50 to-emerald-50', icon: 'bg-teal-100 text-teal-600', border: 'hover:border-teal-200' },
  violet: { bg: 'from-violet-50 to-purple-50', icon: 'bg-violet-100 text-violet-600', border: 'hover:border-violet-200' },
};

const ResourceCard = React.memo<ResourceCardProps>(({ icon: Icon, title, description, href, comingSoon, color }) => {
  const colors = colorMap[color] || colorMap.blue;
  const Content = (
    <div className={`relative h-full p-3 xs:p-4 sm:p-5 rounded-xl bg-gradient-to-br ${colors.bg} border border-gray-100 ${colors.border} transition-all duration-300 hover:shadow-md ${href ? 'cursor-pointer' : ''}`}>
      {comingSoon && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] xs:text-[9px] font-semibold bg-gray-200 text-gray-600 rounded">
          Coming Soon
        </span>
      )}
      <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg ${colors.icon} flex items-center justify-center mb-2 xs:mb-3`}>
        <Icon className="w-4 h-4 xs:w-5 xs:h-5" />
      </div>
      <h3 className="text-xs xs:text-sm sm:text-base font-bold text-gray-900 mb-0.5 xs:mb-1">{title}</h3>
      <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">{description}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {Content}
      </a>
    );
  }
  return Content;
});

ResourceCard.displayName = 'ResourceCard';

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
