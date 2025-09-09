const axios = require('axios');

// AI-powered doubt resolver for rubber-related questions
const resolveDoubt = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid question'
            });
        }

        // Enhanced rubber knowledge base with comprehensive information
        const rubberKnowledgeBase = {
            // Calculator Functions
            calculator: {
                dryContent: "Dry content calculation: (Dry Weight / Wet Weight) × 100. This is crucial for determining the actual rubber content in latex or wet rubber samples.",
                moistureContent: "Moisture content: 100 - Dry Content %. Important for quality control and pricing calculations.",
                density: "Density = Mass / Volume. Typical rubber density ranges from 0.9 to 1.2 g/cm³ depending on the type and additives.",
                costCalculation: "Total Cost = Weight (kg) × Price per kg. Always consider dry weight for accurate cost calculations.",
                volumeCalculation: "Volume calculations vary by shape: Rectangular = L×W×H, Cylindrical = π×r²×h, Spherical = (4/3)×π×r³"
            },
            // Rubber Types and Properties
            types: {
                natural: "Natural rubber is derived from the latex of rubber trees (Hevea brasiliensis). It has excellent elasticity, tear resistance, and low heat buildup. Common applications include tires, medical devices, and industrial products.",
                synthetic: "Synthetic rubber includes various types like SBR (Styrene-Butadiene), NBR (Nitrile), EPDM, and Silicone. Each type has specific properties for different applications - SBR for tires, NBR for oil resistance, EPDM for weather resistance.",
                latex: "Latex rubber is natural rubber in liquid form, used for dipping processes to create thin-walled products like gloves, condoms, and balloons. It offers excellent barrier properties and flexibility."
            },
            
            // Manufacturing Processes
            manufacturing: {
                vulcanization: "Vulcanization is the process of adding sulfur to rubber to improve its strength, elasticity, and resistance to heat and chemicals. This process was discovered by Charles Goodyear in 1839.",
                compounding: "Rubber compounding involves mixing rubber with various additives like fillers (carbon black, silica), plasticizers, antioxidants, and curing agents to achieve desired properties.",
                molding: "Rubber molding includes compression molding, injection molding, and transfer molding. Each method is suitable for different product types and production volumes.",
                extrusion: "Rubber extrusion is used to create continuous profiles like hoses, seals, and gaskets. The process involves forcing rubber through a die to create the desired cross-section."
            },
            
            // Quality Testing
            testing: {
                tensile: "Tensile strength testing measures the maximum stress rubber can withstand before breaking. It's crucial for determining material suitability for specific applications.",
                hardness: "Shore hardness testing (A or D scale) measures rubber's resistance to indentation. Higher numbers indicate harder materials.",
                aging: "Aging tests simulate long-term exposure to heat, oxygen, and ozone to predict rubber's service life and degradation patterns.",
                compression: "Compression set testing measures rubber's ability to recover after being compressed, important for seal applications."
            },
            
            // Market and Pricing
            pricing: {
                factors: "Rubber pricing is influenced by crude oil prices (for synthetic rubber), natural rubber supply from major producing countries (Thailand, Indonesia, Malaysia), demand from automotive and construction industries, and geopolitical factors.",
                trends: "Recent trends show volatility due to supply chain disruptions, environmental regulations, and the shift towards sustainable rubber production.",
                forecasting: "Price forecasting considers weather patterns in rubber-producing regions, global economic conditions, and industry demand projections."
            },
            
            // Common Issues and Solutions
            troubleshooting: {
                degradation: "Rubber degradation can be caused by heat, UV exposure, ozone, oils, and chemicals. Solutions include proper storage, using appropriate rubber compounds, and adding protective additives.",
                cracking: "Cracking often results from over-curing, excessive stress, or environmental exposure. Prevention includes proper compound selection and design considerations.",
                swelling: "Swelling occurs when rubber absorbs liquids. Solution is to select rubber types with appropriate chemical resistance for the application environment."
            },
            
            // Industry Standards
            standards: {
                astm: "ASTM standards cover rubber testing methods, specifications, and quality requirements. Key standards include ASTM D2000 for automotive applications.",
                iso: "ISO standards provide international guidelines for rubber products, testing methods, and quality management systems.",
                automotive: "Automotive rubber must meet specific requirements for temperature resistance, durability, and performance under various conditions."
            }
        };

        // Simple AI-like response generation based on keywords
        const generateResponse = (question) => {
            const lowerQuestion = question.toLowerCase();
            let response = "";
            let category = "";

            // Determine the category and generate appropriate response
            if (lowerQuestion.includes('calculate') || lowerQuestion.includes('calculator') || lowerQuestion.includes('dry content') || lowerQuestion.includes('density') || lowerQuestion.includes('volume') || lowerQuestion.includes('cost')) {
                category = "Calculator Functions";
                response = `Here's information about rubber calculations:\n\n`;
                response += `**Dry Content Calculation:** ${rubberKnowledgeBase.calculator.dryContent}\n\n`;
                response += `**Moisture Content:** ${rubberKnowledgeBase.calculator.moistureContent}\n\n`;
                response += `**Density Calculation:** ${rubberKnowledgeBase.calculator.density}\n\n`;
                response += `**Cost Calculation:** ${rubberKnowledgeBase.calculator.costCalculation}\n\n`;
                response += `**Volume Calculation:** ${rubberKnowledgeBase.calculator.volumeCalculation}\n\n`;
                response += `💡 **Pro Tip:** Use the Rubber Calculator tool in your dashboard for instant calculations!`;
            }
            else if (lowerQuestion.includes('type') || lowerQuestion.includes('kind') || lowerQuestion.includes('natural') || lowerQuestion.includes('synthetic')) {
                category = "Rubber Types";
                response = `Based on your question about rubber types, here's what you should know:\n\n`;
                response += `**Natural Rubber:** ${rubberKnowledgeBase.types.natural}\n\n`;
                response += `**Synthetic Rubber:** ${rubberKnowledgeBase.types.synthetic}\n\n`;
                response += `**Latex Rubber:** ${rubberKnowledgeBase.types.latex}\n\n`;
                response += `Each type has specific advantages depending on your application requirements. Would you like more details about any specific type?`;
            }
            else if (lowerQuestion.includes('manufacturing') || lowerQuestion.includes('process') || lowerQuestion.includes('production') || lowerQuestion.includes('vulcanization')) {
                category = "Manufacturing Processes";
                response = `Here's information about rubber manufacturing processes:\n\n`;
                response += `**Vulcanization:** ${rubberKnowledgeBase.manufacturing.vulcanization}\n\n`;
                response += `**Compounding:** ${rubberKnowledgeBase.manufacturing.compounding}\n\n`;
                response += `**Molding:** ${rubberKnowledgeBase.manufacturing.molding}\n\n`;
                response += `**Extrusion:** ${rubberKnowledgeBase.manufacturing.extrusion}\n\n`;
                response += `The choice of manufacturing process depends on your product design, volume requirements, and material properties needed.`;
            }
            else if (lowerQuestion.includes('test') || lowerQuestion.includes('quality') || lowerQuestion.includes('standard') || lowerQuestion.includes('inspection')) {
                category = "Quality Testing";
                response = `Here are the key rubber testing methods:\n\n`;
                response += `**Tensile Testing:** ${rubberKnowledgeBase.testing.tensile}\n\n`;
                response += `**Hardness Testing:** ${rubberKnowledgeBase.testing.hardness}\n\n`;
                response += `**Aging Tests:** ${rubberKnowledgeBase.testing.aging}\n\n`;
                response += `**Compression Set:** ${rubberKnowledgeBase.testing.compression}\n\n`;
                response += `Regular testing ensures your rubber products meet specifications and perform reliably in their intended applications.`;
            }
            else if (lowerQuestion.includes('price') || lowerQuestion.includes('cost') || lowerQuestion.includes('market') || lowerQuestion.includes('trend')) {
                category = "Market and Pricing";
                response = `Here's information about rubber pricing and market trends:\n\n`;
                response += `**Pricing Factors:** ${rubberKnowledgeBase.pricing.factors}\n\n`;
                response += `**Current Trends:** ${rubberKnowledgeBase.pricing.trends}\n\n`;
                response += `**Forecasting:** ${rubberKnowledgeBase.pricing.forecasting}\n\n`;
                response += `For the most current pricing information, I recommend checking with your suppliers or industry market reports.`;
            }
            else if (lowerQuestion.includes('problem') || lowerQuestion.includes('issue') || lowerQuestion.includes('troubleshoot') || lowerQuestion.includes('degradation') || lowerQuestion.includes('crack')) {
                category = "Troubleshooting";
                response = `Here are common rubber issues and solutions:\n\n`;
                response += `**Degradation:** ${rubberKnowledgeBase.troubleshooting.degradation}\n\n`;
                response += `**Cracking:** ${rubberKnowledgeBase.troubleshooting.cracking}\n\n`;
                response += `**Swelling:** ${rubberKnowledgeBase.troubleshooting.swelling}\n\n`;
                response += `If you're experiencing specific issues, please provide more details about your application and symptoms for more targeted advice.`;
            }
            else if (lowerQuestion.includes('standard') || lowerQuestion.includes('specification') || lowerQuestion.includes('requirement') || lowerQuestion.includes('compliance')) {
                category = "Industry Standards";
                response = `Here are key rubber industry standards:\n\n`;
                response += `**ASTM Standards:** ${rubberKnowledgeBase.standards.astm}\n\n`;
                response += `**ISO Standards:** ${rubberKnowledgeBase.standards.iso}\n\n`;
                response += `**Automotive Standards:** ${rubberKnowledgeBase.standards.automotive}\n\n`;
                response += `Compliance with relevant standards ensures product quality, safety, and market acceptance.`;
            }
            else {
                // General response for other questions
                category = "General Information";
                response = `Thank you for your question about rubber! I'm here to help with various rubber-related topics including:\n\n`;
                response += `• **Types and Properties** - Natural, synthetic, and specialty rubbers\n`;
                response += `• **Manufacturing Processes** - Vulcanization, molding, extrusion\n`;
                response += `• **Quality Testing** - Tensile, hardness, aging tests\n`;
                response += `• **Market Trends** - Pricing factors and industry outlook\n`;
                response += `• **Troubleshooting** - Common issues and solutions\n`;
                response += `• **Standards** - Industry specifications and requirements\n\n`;
                response += `Could you please be more specific about what aspect of rubber you'd like to know about? I can provide detailed information once I understand your specific needs.`;
            }

            return { response, category };
        };

        const { response, category } = generateResponse(question);

        // Log the interaction for analytics (optional)
        console.log(`AI Doubt Resolver - Category: ${category}, Question: ${question.substring(0, 100)}...`);

        res.status(200).json({
            success: true,
            answer: response,
            category: category,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in AI doubt resolver:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// Get AI chat history for a user (optional feature)
const getChatHistory = async (req, res) => {
    try {
        // This could be implemented to store and retrieve chat history
        // For now, returning empty array
        res.status(200).json({
            success: true,
            history: []
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat history'
        });
    }
};

// Rubber calculator API endpoint
const calculateRubber = async (req, res) => {
    try {
        const { type, data } = req.body;

        if (!type || !data) {
            return res.status(400).json({
                success: false,
                message: 'Calculation type and data are required'
            });
        }

        let result = {};

        switch (type) {
            case 'dry-content':
                const { wetWeight, dryWeight } = data;
                if (wetWeight && dryWeight && wetWeight > 0) {
                    result.dryContent = ((dryWeight / wetWeight) * 100).toFixed(2);
                    result.moistureContent = (100 - result.dryContent).toFixed(2);
                }
                break;

            case 'density':
                const { mass, volume } = data;
                if (mass && volume && volume > 0) {
                    result.density = (mass / volume).toFixed(3);
                }
                break;

            case 'cost':
                const { weight, pricePerKg } = data;
                if (weight && pricePerKg) {
                    result.totalCost = (weight * pricePerKg).toFixed(2);
                }
                break;

            case 'volume':
                const { shape, dimensions } = data;
                if (shape && dimensions) {
                    let volume = 0;
                    switch (shape) {
                        case 'rectangular':
                            volume = dimensions.length * dimensions.width * dimensions.height;
                            break;
                        case 'cylindrical':
                            volume = Math.PI * dimensions.radius * dimensions.radius * dimensions.height;
                            break;
                        case 'spherical':
                            volume = (4/3) * Math.PI * dimensions.radius * dimensions.radius * dimensions.radius;
                            break;
                    }
                    result.volume = volume.toFixed(3);
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid calculation type'
                });
        }

        res.status(200).json({
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in rubber calculator:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

module.exports = {
    resolveDoubt,
    getChatHistory,
    calculateRubber
};
