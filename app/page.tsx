import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-dvh flex flex-col bg-linear-to-b from-[#E7FFB9] via-emerald-300 to-blue-300">
            <main className="flex-1 w-full max-w-6xl mx-auto p-6 text-black flex flex-col">
                <div className="shadow-md bg-white h-full rounded-lg p-6 flex-1 flex-col items-center">

                    <div className="p-4 text-4xl text-center">Jackson Wright's Website</div>
                    <div className="p-4 text-l text-center">
                        Welcome to my website!
                        Here you can find information about me, links to my profiles on other websites, and some personal projects.
                        <br/><br/>
                        I graduated from Michigan State University in 2026 with a B.S. in computer science.
                        I also minored in mathematics and CMSE.
                        For contact information, or to learn more about my education and work experience, please visit the resume linked on this page.
                        <br/><br/>
                        In my free time, I enjoy programming, playing the piano, composing music, video games, cooking, biking, and more.  
                    </div>

                    <div className="flex flex-row justify-around">
                        <div className="flex-1 flex flex-col items-center">
                            <div className="p-4 text-2xl text-center">Links to Other Websites</div>
                            <ul className="p-4 text-center">
                                <li><a href="https://docs.google.com/document/d/1HOXhOrEMgyCefeUX7OC_kM4NW-zTf1uRs9cql1WmlkE/edit?usp=sharing">Resume</a></li>
                                <li><a href="https://github.com/Spizzicato">GitHub</a></li>
                                <li><a href="https://www.linkedin.com/in/jackson-wright-61008a30b/">LinkedIn</a></li>
                                <li><a href="https://leetcode.com/u/Spizzicato/">LeetCode</a></li>
                            </ul>
                        </div>
                        <div className="flex-1 flex-col items-center">
                            <div className="p-4 text-2xl text-center">Online Projects</div>
                            <ul className="p-4 text-center">
                                <li><Link href="/wafflegame">Waffle Game</Link></li>
                            </ul>
                        </div>
                    </div>
            
                </div>
            </main>
        </div>
    );
}
