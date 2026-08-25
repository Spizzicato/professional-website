import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="grid grid-rows-[auto_1fr] gap-6 min-h-dvh max-w-6xl mx-auto p-6">

            <div className="basic-card">
                <div className="p-4 text-4xl text-center">Jackson Wright's Website</div>
                <div className="p-4 text-l">
                    Welcome to my website!
                    Here you can find information about me, links to my resume and profiles on other websites, and some personal projects.
                    <br/><br/>
                    I graduated from Michigan State University in 2026 with a B.S. in computer science.
                    I also minored in mathematics and Computational Mathematics, Science, and Engineering (CMSE).
                    For contact information, or to learn more about my education and work experience, please visit the resume linked on this page.
                    <br/><br/>
                    In my free time, I enjoy programming, playing the piano, composing music, video games, cooking, biking, and more.  
                </div>
            </div>

            <div className="basic-card text-center">
                <div className="grid grid-rows-[auto_1fr_auto_1fr] grid-cols-1 grid-flow-col md:grid-rows-[auto_1fr] md:grid-cols-[40%_40%] gap-y-4 justify-around">
                    
                    <div>
                        <div className="p-4 text-2xl text-center whitespace-nowrap">Links</div>
                        <hr/>
                    </div>
                    <div className="grid grid-cols-1 justify-items-center">
                        <Link href="https://drive.google.com/file/d/1BSi26PO8rQ16zoABcI_kasdMA3qIW4mw/view?usp=sharing">Resume</Link>
                        <Link href="https://github.com/Spizzicato">GitHub</Link>
                        <Link href="https://www.linkedin.com/in/jackson-wright-61008a30b/">LinkedIn</Link>
                        <Link href="https://leetcode.com/u/Spizzicato/">LeetCode</Link>
                    </div>

                    <div>
                        <div className="p-4 text-2xl text-center whitespace-nowrap">Online Projects</div>
                        <hr/>
                    </div>
                    <div className="grid grid-cols-2 auto-rows-max gap-x-4 text-center [&>a:nth-child(odd)]:justify-self-start [&>a:nth-child(even)]:justify-self-end">
                        <Link href="/wafflegame">Waffle Game</Link> <Link href="/wafflegame/info">Project Info</Link>
                    </div>

                </div>
            </div>

        </main>
    );
}
