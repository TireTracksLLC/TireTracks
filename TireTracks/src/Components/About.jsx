
export default function About() {
    return (
        <section className AboutBackground>
            <div className='About-Overlay'>
                <div className='AboutCard'>
                    <h1>Our Commitment to Tireshops</h1> 
                    <container className='AboutText'>
                        <div>
                            <h2>Purpose</h2>
                            <p> Our purpose is to make operating your business easier. Let us handle your inventory while you make your business thrive.
                            </p>
                        </div>
                        <div>
                            <h2>Efficieny</h2>
                            <p> TireTracks will speed up every facet of your business. The need to do things manually is now gone when you have us in your corner.</p>
                        </div>
                        <div>
                            <h2>Clarity</h2>
                            <p> You no longer have to guess on what is in your inventory. We track it so that you can sell it. Let us handle the hard work.</p>
                        </div>
                    </container>
                </div>
                <img className='AboutDividerImg' src='/AmericanTire-6463.jpg' alt='About Divider'></img>
                <div className='AboutCard'>
                    <h1>How we differ from the rest</h1>
                        <container className='AboutText'>
                            <div >
                                <h2>Performance</h2>
                                <p>
                                    We know the struggles of trying to keep a proper inventory, so we take that struggle out of your hands. 
                                    With TireTracks, tracking your inventory has neverbeen easier
                                </p>
                            </div>
                             <div>
                                <h2>Growth</h2>
                                <p>
                                    We at TireTracks try to make it as easy as possible for your company to grow. We provide the tools that allows your company to expand
                                    in inventory.
                                </p>
                            </div>
                             <div >
                                <h2>Communication</h2>
                                <p>
                                    We want an open line of communication that allows you to give us feedback on what is good and what is not. Help us help you and watch your change
                                    make an impact.
                                </p>
                            </div>
                        </container>
                </div>
            </div>
        </section>
    )

}