import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-dvh flex flex-col bg-linear-to-b from-[#E7FFB9] via-emerald-300 to-blue-300">
            <main className="grid min-h-dvh max-w-6xl mx-auto p-6 text-black flex flex-col grid-rows-[auto_1fr] gap-6">

                <div className="shadow-md bg-white h-full rounded-lg p-6 flex-1 flex-col items-center">
                    <div className="p-4 text-4xl text-center">Jackson Wright's Website</div>
                    <div className="p-4 text-l text-center">
                        Welcome to my website!
                        Here you can find information about me, links to my profiles on other websites, and some personal projects.
                        <br/><br/>
                        I graduated from Michigan State University in 2026 with a B.S. in computer science.
                        I also minored in mathematics and Computational Mathematics, Science, and Engineering (CMSE).
                        For contact information, or to learn more about my education and work experience, please visit the resume linked on this page.
                        <br/><br/>
                        In my free time, I enjoy programming, playing the piano, composing music, video games, cooking, biking, and more.  
                    </div>
                </div>

                <div className="shadow-md bg-white h-full rounded-lg p-6 flex-1 flex-col items-center">
                    <div className="grid grid-rows-[auto_1fr_auto_1fr] grid-cols-1 grid-flow-col md:grid-rows-[auto_1fr] md:grid-cols-2">
                        
                        <div className="p-4 text-2xl text-center whitespace-nowrap">Links</div>
                        <ul className="p-4 text-center">
                            <li><a href="https://drive.google.com/file/d/1BSi26PO8rQ16zoABcI_kasdMA3qIW4mw/view?usp=sharing">Resume</a></li>
                            <li><a href="https://github.com/Spizzicato">GitHub</a></li>
                            <li><a href="https://www.linkedin.com/in/jackson-wright-61008a30b/">LinkedIn</a></li>
                            <li><a href="https://leetcode.com/u/Spizzicato/">LeetCode</a></li>
                        </ul>

                        <div className="p-4 text-2xl text-center whitespace-nowrap">Online Projects</div>
                        <ul className="p-4 text-center">
                            <li><Link href="/wafflegame">Waffle Game</Link></li>
                        </ul>

                    </div>
                </div>

            </main>
        </div>
    );
}
