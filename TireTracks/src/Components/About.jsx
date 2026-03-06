
export default function About() {
    return (
        <section className AboutBackground>
            <div className='About-Overlay'>
                <div className='AboutCard1'>
                    <h1>Our Commitment to Tireshops</h1> 
                    <container className='AboutText'>
                        <div>
                            <h2>Purpose</h2>
                            <p> TireTracks is a tire tracking software made with the purpose of helping businesses better manage their inventory.
                                With this idea in mind. We produce a product aimed at giving tire shops the best service possible.
                            </p>
                        </div>
                        <div>
                            <h2>Efficieny</h2>
                            <p> TireTracks is a tire tracking software made with the purpose of helping businesses better manage their inventory</p>
                        </div>
                        <div>
                            <h2>Clarity</h2>
                            <p> TireTracks is a tire tracking software made with the purpose of helping businesses better manage their inventory</p>
                        </div>
                    </container>
                </div>
                <img className='AboutDividerImg' src='/AmericanTire-6463.jpg' alt='About Divider'></img> 
                <div className='AboutCard2'>
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
                                    We know the struggles of trying to keep a proper inventory, so we take that struggle out of your hands. 
                                    With TireTracks, tracking your inventory has neverbeen easier
                                </p>
                            </div>
                             <div >
                                <h2>Communication</h2>
                                <p>
                                    We know the struggles of trying to keep a proper inventory, so we take that struggle out of your hands. 
                                    With TireTracks, tracking your inventory has neverbeen easier
                                </p>
                            </div>
                        </container>
                </div>
            </div>
        </section>
    )

}