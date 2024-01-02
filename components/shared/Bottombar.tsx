//this will be used in mobile view...instead of left side I am moving it down as we have in typical instagram mobile app
'use client'
import { sidebarLinks } from "@/constants";
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image';


function Bottombar(){

    const pathname = usePathname();

    return (
        <section className="bottombar">
            <div className="bottombar_container" >
                {sidebarLinks.map((link)=>{
                        const isActive = (pathname.includes(link.route) && link.route.length>1 || pathname === link.route)

                        return (
                        <Link
                            href={link.route}
                            key={link.label}
                            className={`bottombar_link ${isActive && 'bg-primary-500'}`}
                        >
                        <Image
                            src={link.imgURL}
                            alt={link.label}
                            width={24}
                            height={24}
                        />
                        <p className='text-light-1 max-lg:hidden'>{link.label}</p>
                        </Link>
                    )})}   
            </div>
        </section>
    )
}
export default Bottombar;