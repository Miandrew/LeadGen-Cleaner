-- ============================================================
-- CommercialCleaningNearMe.com — Demo Seed Data
-- Paste this into the Supabase SQL Editor and click Run.
-- Run schema.sql first if you haven't already.
-- ============================================================

-- ============================================================
-- COMPANIES (35 across 10 major US cities)
-- ============================================================

insert into companies (id, name, slug, city, state, zip, phone, email, website, description, services, rating, review_count, years_in_business, employee_count, certifications, claimed, active) values

-- NEW YORK
('11111111-0001-0001-0001-000000000001', 'Premier Office Solutions', 'premier-office-solutions-new-york', 'New York', 'NY', '10001', '(212) 555-0101', 'info@premierofficesolutions.com', 'https://premierofficesolutions.com',
 'Premier Office Solutions has served Manhattan businesses for over 18 years. We specialize in daily and weekly janitorial services for commercial offices, law firms, and financial institutions. Our bonded, insured staff uses eco-friendly products and maintains the highest standards of professionalism.',
 ARRAY['Office Cleaning','Janitorial','Floor Care'], 4.8, 142, 18, '50+', ARRAY['ISSA Certified','OSHA Compliant','Green Clean Certified'], true, true),

('11111111-0001-0002-0001-000000000002', 'MetroClean NY', 'metroclean-ny-new-york', 'New York', 'NY', '10016', '(212) 555-0102', 'hello@metroclean.com', 'https://metrocleannyc.com',
 'MetroClean NY delivers premium commercial cleaning across all five boroughs. Specializing in medical facilities, corporate offices, and retail spaces. We provide 24/7 scheduling and emergency cleaning services for New York''s busiest businesses.',
 ARRAY['Office Cleaning','Medical Cleaning','Janitorial','Window Cleaning'], 4.6, 89, 12, '31-50', ARRAY['HIPAA Compliant','ISSA Certified'], true, true),

('11111111-0001-0003-0001-000000000003', 'Skyline Commercial Cleaners', 'skyline-commercial-cleaners-new-york', 'New York', 'NY', '10036', '(646) 555-0103', 'contact@skylineclean.com', null,
 'Family-owned cleaning company serving midtown Manhattan since 2009. We take pride in attention to detail and building lasting relationships with our clients. Specializing in high-rise office buildings and post-construction cleanup.',
 ARRAY['Office Cleaning','Post-Construction','Janitorial'], 4.5, 63, 15, '16-30', ARRAY['Licensed & Insured','Green Certified'], false, true),

-- LOS ANGELES
('22222222-0002-0001-0002-000000000001', 'LA Shine Commercial Cleaning', 'la-shine-commercial-cleaning-los-angeles', 'Los Angeles', 'CA', '90010', '(213) 555-0201', 'info@lashine.com', 'https://lashine.com',
 'LA Shine brings Hollywood-quality cleaning to your commercial space. From boutique offices in Beverly Hills to sprawling warehouses in the Valley, our team delivers consistent, reliable results. LEED-certified cleaning protocols available for green-certified buildings.',
 ARRAY['Office Cleaning','Janitorial','Carpet Cleaning','Floor Care'], 4.9, 207, 10, '31-50', ARRAY['LEED Certified','Green Clean Certified','Insured & Bonded'], true, true),

('22222222-0002-0002-0002-000000000002', 'Pacific Coast Janitorial', 'pacific-coast-janitorial-los-angeles', 'Los Angeles', 'CA', '90025', '(310) 555-0202', 'ops@pacificcoastjanitorial.com', 'https://pacificcoastjan.com',
 'Serving West LA, Santa Monica, and Culver City for 22 years. We provide comprehensive janitorial services for office buildings, medical centers, and schools. Our environmentally responsible approach uses only EPA-approved, low-VOC cleaning products.',
 ARRAY['Janitorial','Medical Cleaning','Office Cleaning','Window Cleaning'], 4.7, 158, 22, '50+', ARRAY['ISSA Certified','CIMS Certified','OSHA Compliant'], true, true),

('22222222-0002-0003-0002-000000000003', 'SoCal Industrial Cleaning', 'socal-industrial-cleaning-los-angeles', 'Los Angeles', 'CA', '90058', '(323) 555-0203', 'info@socalindustrial.com', null,
 'Specialists in industrial and warehouse cleaning throughout the greater Los Angeles area. Power washing, floor stripping, high-ceiling dusting, and post-construction cleanouts. Serving manufacturing, logistics, and film production facilities.',
 ARRAY['Industrial','Post-Construction','Floor Care'], 4.4, 47, 8, '16-30', ARRAY['OSHA Compliant','Licensed & Insured'], false, true),

-- CHICAGO
('33333333-0003-0001-0003-000000000001', 'Windy City Clean', 'windy-city-clean-chicago', 'Chicago', 'IL', '60601', '(312) 555-0301', 'info@windycityclean.com', 'https://windycityclean.com',
 'Chicago''s most trusted commercial cleaning company since 2001. We serve the Loop, River North, and surrounding neighborhoods with daily, weekly, and monthly cleaning programs tailored to your business. Trusted by over 300 Chicago businesses.',
 ARRAY['Office Cleaning','Janitorial','Floor Care','Carpet Cleaning'], 4.8, 312, 23, '50+', ARRAY['ISSA Certified','BBB A+ Rating','Green Certified'], true, true),

('33333333-0003-0002-0003-000000000002', 'Great Lakes Facility Services', 'great-lakes-facility-services-chicago', 'Chicago', 'IL', '60654', '(312) 555-0302', 'contact@greatlakesfacility.com', 'https://greatlakesfacility.com',
 'Full-service facility management and commercial cleaning for Chicago''s corporate headquarters, law firms, and financial institutions. We offer integrated services including cleaning, maintenance, and day porter programs.',
 ARRAY['Office Cleaning','Janitorial','Window Cleaning','Medical Cleaning'], 4.6, 94, 15, '31-50', ARRAY['CIMS Gold Certified','HIPAA Compliant','ISSA Member'], true, true),

('33333333-0003-0003-0003-000000000003', 'Midwest Post-Construction Cleanup', 'midwest-post-construction-cleanup-chicago', 'Chicago', 'IL', '60638', '(773) 555-0303', 'bids@midwestpcc.com', null,
 'Chicago''s go-to for post-construction and renovation cleanup. We work directly with general contractors and project managers to handle final cleaning before occupancy. Fast turnaround, detailed walkthroughs, and move-in ready results guaranteed.',
 ARRAY['Post-Construction','Industrial','Janitorial'], 4.3, 38, 7, '16-30', ARRAY['Licensed & Insured','OSHA Compliant'], false, true),

-- HOUSTON
('44444444-0004-0001-0004-000000000001', 'Lone Star Commercial Cleaning', 'lone-star-commercial-cleaning-houston', 'Houston', 'TX', '77002', '(713) 555-0401', 'info@lonestarclean.com', 'https://lonestarcleanhouston.com',
 'Houston''s premier commercial cleaning company serving the Energy Corridor, Downtown, and Galleria areas. We specialize in large-footprint facilities including office towers, hospitals, and industrial plants. Veteran-owned and operated.',
 ARRAY['Office Cleaning','Janitorial','Medical Cleaning','Industrial'], 4.7, 176, 14, '50+', ARRAY['Veteran-Owned','ISSA Certified','Joint Commission Compliant'], true, true),

('44444444-0004-0002-0004-000000000002', 'Gulf Coast Janitorial Services', 'gulf-coast-janitorial-services-houston', 'Houston', 'TX', '77056', '(832) 555-0402', 'sales@gulfcoastjan.com', 'https://gulfcoastjan.com',
 'Family-owned janitorial company serving Houston businesses since 2005. We provide flexible scheduling — day, evening, or overnight — to minimize disruption to your operations. Specializing in medical offices, dental practices, and outpatient clinics.',
 ARRAY['Janitorial','Medical Cleaning','Office Cleaning','Carpet Cleaning'], 4.5, 112, 19, '31-50', ARRAY['HIPAA Compliant','ISSA Certified','Insured & Bonded'], true, true),

('44444444-0004-0003-0004-000000000003', 'Texas Industrial Clean', 'texas-industrial-clean-houston', 'Houston', 'TX', '77015', '(713) 555-0403', 'ops@texasindustrialclean.com', null,
 'Industrial-grade cleaning for Houston''s oil & gas, chemical, and manufacturing sectors. High-pressure washing, tank cleaning, facility turnaround services. We operate 24/7 to keep your facility compliant and operational.',
 ARRAY['Industrial','Post-Construction','Floor Care'], 4.4, 55, 11, '16-30', ARRAY['OSHA 30 Certified','Confined Space Certified','Licensed & Insured'], false, true),

-- DALLAS
('55555555-0005-0001-0005-000000000001', 'Big D Building Services', 'big-d-building-services-dallas', 'Dallas', 'TX', '75201', '(214) 555-0501', 'info@bigdbuildingservices.com', 'https://bigdbuildingservices.com',
 'Dallas-Fort Worth''s leading commercial cleaning and facilities services provider. With over 500 client locations across North Texas, we deliver consistent quality at scale. ISO 9001 certified processes ensure the same high standard at every visit.',
 ARRAY['Office Cleaning','Janitorial','Window Cleaning','Floor Care'], 4.9, 284, 20, '50+', ARRAY['ISO 9001 Certified','ISSA CIMS','Green Seal Certified'], true, true),

('55555555-0005-0002-0005-000000000002', 'DFW MedClean Solutions', 'dfw-medclean-solutions-dallas', 'Dallas', 'TX', '75230', '(972) 555-0502', 'contact@dfwmedclean.com', 'https://dfwmedclean.com',
 'Specialized healthcare and medical facility cleaning for Dallas, Plano, and Frisco. Our technicians are trained in CDC disinfection protocols, bloodborne pathogen handling, and sterile environment maintenance. Serving hospitals, surgical centers, and clinics.',
 ARRAY['Medical Cleaning','Office Cleaning','Janitorial'], 4.8, 139, 9, '31-50', ARRAY['Joint Commission Certified','HIPAA Compliant','CDC Protocol Trained'], true, true),

('55555555-0005-0003-0005-000000000003', 'North Texas Carpet & Floor Care', 'north-texas-carpet-floor-care-dallas', 'Dallas', 'TX', '75247', '(214) 555-0503', 'hello@ntxfloorcare.com', null,
 'Commercial carpet cleaning and hard floor restoration specialists serving the DFW metroplex. Hot water extraction, encapsulation, VCT stripping and waxing, concrete polishing. We work nights and weekends so your business never misses a beat.',
 ARRAY['Carpet Cleaning','Floor Care','Office Cleaning'], 4.6, 83, 13, '16-30', ARRAY['IICRC Certified','Licensed & Insured'], false, true),

-- PHOENIX
('66666666-0006-0001-0006-000000000001', 'Desert Clean Commercial', 'desert-clean-commercial-phoenix', 'Phoenix', 'AZ', '85004', '(602) 555-0601', 'info@desertcleanaz.com', 'https://desertcleanaz.com',
 'Phoenix''s top-rated commercial cleaning company for 11 years running. We understand the unique challenges of desert environments — dust control, HVAC filter cleaning, and maintaining pristine spaces in extreme heat. Serving Scottsdale, Tempe, and Chandler.',
 ARRAY['Office Cleaning','Janitorial','Floor Care','Window Cleaning'], 4.7, 198, 11, '31-50', ARRAY['ISSA Certified','AZ Licensed','Green Certified'], true, true),

('66666666-0006-0002-0006-000000000002', 'Valley Medical Cleaning', 'valley-medical-cleaning-phoenix', 'Phoenix', 'AZ', '85016', '(480) 555-0602', 'ops@valleymedclean.com', 'https://valleymedclean.com',
 'Arizona''s premier medical and healthcare facility cleaning specialist. Serving Banner Health, Dignity Health, and hundreds of independent practices across the Phoenix metro. Our staff undergoes background checks, drug testing, and ongoing training.',
 ARRAY['Medical Cleaning','Office Cleaning','Janitorial'], 4.8, 167, 8, '16-30', ARRAY['Joint Commission Approved','HIPAA Compliant','Bloodborne Pathogen Trained'], true, true),

('66666666-0006-0003-0006-000000000003', 'Southwest Post-Construction', 'southwest-post-construction-phoenix', 'Phoenix', 'AZ', '85040', '(623) 555-0603', 'bids@swpostconstruction.com', null,
 'Rapid-response post-construction and renovation cleanup throughout metro Phoenix. We coordinate with your GC for punch-list cleanings, rough cleanings, and final walkthroughs. State licensed and fully insured. Free on-site bids within 24 hours.',
 ARRAY['Post-Construction','Industrial','Floor Care'], 4.3, 44, 6, '16-30', ARRAY['AZ Contractor Licensed','OSHA Compliant'], false, true),

-- SEATTLE
('77777777-0007-0001-0007-000000000001', 'Cascade Commercial Cleaning', 'cascade-commercial-cleaning-seattle', 'Seattle', 'WA', '98101', '(206) 555-0701', 'info@cascadeclean.com', 'https://cascadeclean.com',
 'Seattle''s eco-conscious commercial cleaning company. We use only green-certified, biodegradable cleaning products and have partnered with dozens of LEED-certified buildings across downtown Seattle, Bellevue, and Kirkland. B Corp certified business.',
 ARRAY['Office Cleaning','Janitorial','Window Cleaning','Floor Care'], 4.9, 223, 16, '31-50', ARRAY['B Corp Certified','Green Seal Gold','LEED Partner','ISSA CIMS-GB'], true, true),

('77777777-0007-0002-0007-000000000002', 'Pacific Northwest Facility Services', 'pacific-northwest-facility-services-seattle', 'Seattle', 'WA', '98109', '(425) 555-0702', 'contact@pnwfacility.com', 'https://pnwfacility.com',
 'Full-spectrum facility services for Seattle''s tech industry and beyond. We manage cleaning programs for over 200 tech offices, co-working spaces, and corporate campuses. Flexible billing, online scheduling, and dedicated account managers.',
 ARRAY['Office Cleaning','Janitorial','Carpet Cleaning','Medical Cleaning'], 4.6, 118, 12, '50+', ARRAY['ISSA Certified','ISO 9001','Licensed & Bonded'], true, true),

('77777777-0007-0003-0007-000000000003', 'Sound Industrial Cleaning', 'sound-industrial-cleaning-seattle', 'Seattle', 'WA', '98134', '(206) 555-0703', 'info@soundindustrial.com', null,
 'Heavy industrial cleaning for Seattle''s manufacturing, marine, and aerospace sectors. Factory floor cleaning, pressure washing, parts degreasing, and hazmat-compliant waste removal. Serving Boeing, shipyards, and Port of Seattle facilities.',
 ARRAY['Industrial','Post-Construction','Floor Care'], 4.5, 61, 9, '16-30', ARRAY['OSHA 30 Certified','EPA Compliant','Licensed & Insured'], false, true),

-- DENVER
('88888888-0008-0001-0008-000000000001', 'Mile High Commercial Cleaning', 'mile-high-commercial-cleaning-denver', 'Denver', 'CO', '80202', '(303) 555-0801', 'info@milehighclean.com', 'https://milehighclean.com',
 'Denver''s fastest-growing commercial cleaning company. We combine cutting-edge electrostatic disinfection technology with traditional janitorial services. Serving LoDo, RiNo, and Cherry Creek with day porter, overnight, and weekend programs.',
 ARRAY['Office Cleaning','Janitorial','Medical Cleaning','Floor Care'], 4.7, 156, 7, '31-50', ARRAY['ISSA Certified','Electrostatic Disinfection Certified','CO Licensed'], true, true),

('88888888-0008-0002-0008-000000000002', 'Rocky Mountain Green Clean', 'rocky-mountain-green-clean-denver', 'Denver', 'CO', '80218', '(720) 555-0802', 'hello@rockymountaingreen.com', 'https://rockymountaingreen.com',
 'Colorado''s leader in sustainable commercial cleaning. Every product we use is EPA Safer Choice certified. We''ve helped 150+ Denver businesses achieve LEED points through our green cleaning programs. Carbon-neutral operations since 2020.',
 ARRAY['Office Cleaning','Janitorial','Window Cleaning','Carpet Cleaning'], 4.8, 134, 10, '16-30', ARRAY['Green Seal Certified','EPA Safer Choice Partner','LEED Certified'], true, true),

('88888888-0008-0003-0008-000000000003', 'Front Range Carpet Care', 'front-range-carpet-care-denver', 'Denver', 'CO', '80219', '(303) 555-0803', 'info@frontrangecarpet.com', null,
 'Commercial carpet and upholstery cleaning specialists serving the Denver metro. Hot water extraction, dry compound cleaning, and stain treatment for high-traffic office environments. We also handle VCT, hardwood, and tile floor restoration.',
 ARRAY['Carpet Cleaning','Floor Care','Office Cleaning'], 4.4, 72, 14, '6-15', ARRAY['IICRC Master Textile Cleaner','CO Licensed'], false, true),

-- ATLANTA
('99999999-0009-0001-0009-000000000001', 'Peach State Commercial Cleaning', 'peach-state-commercial-cleaning-atlanta', 'Atlanta', 'GA', '30303', '(404) 555-0901', 'info@peachstateclean.com', 'https://peachstateclean.com',
 'Atlanta''s trusted commercial cleaning partner since 2003. We serve Midtown, Buckhead, and the metro Atlanta area with comprehensive janitorial, porter, and specialty cleaning services. Minority-owned business with over 400 active clients.',
 ARRAY['Office Cleaning','Janitorial','Floor Care','Carpet Cleaning'], 4.8, 267, 21, '50+', ARRAY['MBE Certified','ISSA CIMS','GA Licensed','BBB Accredited'], true, true),

('99999999-0009-0002-0009-000000000002', 'ATL MedClean', 'atl-medclean-atlanta', 'Atlanta', 'GA', '30322', '(678) 555-0902', 'ops@atlmedclean.com', 'https://atlmedclean.com',
 'Healthcare facility cleaning specialists for the Atlanta metro. Grady, Emory, Piedmont, and hundreds of outpatient practices trust us for compliant, thorough cleaning. EVS consulting and infection prevention protocols available.',
 ARRAY['Medical Cleaning','Office Cleaning','Janitorial'], 4.7, 143, 11, '31-50', ARRAY['HIPAA Compliant','Joint Commission Ready','ISSA CIMS','CDC Protocol Certified'], true, true),

('99999999-0009-0003-0009-000000000003', 'Southern Industrial Services', 'southern-industrial-services-atlanta', 'Atlanta', 'GA', '30318', '(404) 555-0903', 'contact@southernindustrialsvcs.com', null,
 'Industrial cleaning and facility maintenance for Atlanta''s manufacturing and distribution corridors. Warehouse sweeping, floor scrubbing, pressure washing, and post-construction cleanup. We operate 24/7 to fit your production schedule.',
 ARRAY['Industrial','Post-Construction','Floor Care'], 4.3, 49, 8, '16-30', ARRAY['OSHA Compliant','GA Licensed','Licensed & Insured'], false, true),

-- MIAMI
('aaaaaaaa-000a-0001-000a-0000000000a1', 'South Beach Commercial Clean', 'south-beach-commercial-clean-miami', 'Miami', 'FL', '33139', '(305) 555-1001', 'info@southbeachclean.com', 'https://southbeachclean.com',
 'Miami''s premier commercial cleaning company, serving Brickell, Wynwood, and the Beach for 13 years. We understand the humidity and coastal environment challenges unique to South Florida. Bilingual staff, 24/7 availability, and same-day emergency service.',
 ARRAY['Office Cleaning','Janitorial','Window Cleaning','Floor Care'], 4.8, 189, 13, '31-50', ARRAY['ISSA Certified','FL Licensed','Bilingual Staff','Green Certified'], true, true),

('aaaaaaaa-000a-0002-000a-0000000000a2', 'Florida Medical Cleaning Specialists', 'florida-medical-cleaning-specialists-miami', 'Miami', 'FL', '33136', '(786) 555-1002', 'contact@flmedclean.com', 'https://flmedclean.com',
 'Specialized cleaning for South Florida''s world-class healthcare facilities. Jackson Health System, Baptist Health, and dozens of private practices rely on our compliant, thorough cleaning programs. AHCA-compliant services available.',
 ARRAY['Medical Cleaning','Office Cleaning','Janitorial','Carpet Cleaning'], 4.9, 211, 9, '31-50', ARRAY['AHCA Compliant','HIPAA Compliant','Joint Commission Certified','ISSA Member'], true, true),

('aaaaaaaa-000a-0003-000a-0000000000a3', 'Tropical Post-Construction Cleanup', 'tropical-post-construction-cleanup-miami', 'Miami', 'FL', '33142', '(305) 555-1003', 'bids@tropicalpostconstruction.com', null,
 'Post-construction and renovation cleaning for Miami''s booming real estate market. From luxury condo final cleanings in Brickell to commercial buildouts in Doral. We coordinate with project managers and move fast to meet your occupancy deadlines.',
 ARRAY['Post-Construction','Industrial','Floor Care'], 4.5, 67, 5, '16-30', ARRAY['FL Contractor License','OSHA Compliant','Insured & Bonded'], false, true);

-- ============================================================
-- REVIEWS
-- ============================================================

insert into reviews (company_id, author, rating, review_text, review_date, source) values

-- Premier Office Solutions (NY)
('11111111-0001-0001-0001-000000000001', 'Jennifer Walsh', 5, 'Premier has been cleaning our law firm for 3 years. Reliable, thorough, and professional every single time. Our senior partners have noticed the difference.', '2024-11-15', 'google'),
('11111111-0001-0001-0001-000000000001', 'Marcus Chen', 5, 'Best commercial cleaning company in Manhattan, period. They show up on time, do an exceptional job, and are always responsive when we have special requests.', '2024-10-02', 'google'),
('11111111-0001-0001-0001-000000000001', 'Rachel Goldstein', 4, 'Very good service overall. Occasionally a staff member changes but quality stays consistent. Would definitely recommend for any office.', '2024-09-18', 'google'),

-- MetroClean NY
('11111111-0001-0002-0001-000000000002', 'Dr. Priya Sharma', 5, 'We run a busy medical practice and MetroClean handles our stringent cleaning requirements perfectly. HIPAA-aware staff and always thorough.', '2024-12-01', 'google'),
('11111111-0001-0002-0001-000000000002', 'Tom Fitzpatrick', 4, 'Solid company. They stepped in when our previous cleaner flaked and have been consistent ever since. Good pricing for NYC.', '2024-10-22', 'google'),

-- LA Shine
('22222222-0002-0001-0002-000000000001', 'Stephanie Nguyen', 5, 'LA Shine is absolutely exceptional. Our creative agency has never looked cleaner. The team is friendly, fast, and thorough.', '2024-12-10', 'google'),
('22222222-0002-0001-0002-000000000001', 'Brandon Miller', 5, 'We''ve tried 4 commercial cleaners in LA. LA Shine is by far the best. Professional, eco-friendly, and great customer service.', '2024-11-28', 'google'),
('22222222-0002-0001-0002-000000000001', 'Karen Okafor', 5, 'They do our 8,000 sq ft office in Beverly Hills. Impeccable results every week. Highly recommend.', '2024-10-15', 'google'),

-- Pacific Coast Janitorial
('22222222-0002-0002-0002-000000000002', 'Dr. James Watanabe', 5, 'Pacific Coast has been cleaning our medical office for 6 years. They understand the compliance requirements and always exceed expectations.', '2024-11-20', 'google'),
('22222222-0002-0002-0002-000000000002', 'Lisa Hernandez', 4, 'Reliable and professional. They''ve been great for our school district facilities. Pricing is fair and the team is courteous.', '2024-10-08', 'google'),

-- Windy City Clean
('33333333-0003-0001-0003-000000000001', 'Robert Kowalski', 5, 'Windy City Clean has been our janitorial company for 7 years. They''re like family at this point. Never missed a day, always spotless.', '2024-12-05', 'google'),
('33333333-0003-0001-0003-000000000001', 'Amanda Torres', 5, 'Took over from a lousy company and transformed our office. The floor care team especially does an incredible job.', '2024-11-11', 'google'),
('33333333-0003-0001-0003-000000000001', 'Michael O''Brien', 4, 'Excellent service, fair pricing, and always accommodating with schedule changes. Classic Chicago business done right.', '2024-09-30', 'google'),

-- Lone Star Commercial Cleaning
('44444444-0004-0001-0004-000000000001', 'Carlos Reyes', 5, 'Lone Star cleans our oil & gas corporate office and they are top-notch. Veteran-owned and it shows — disciplined and reliable.', '2024-12-08', 'google'),
('44444444-0004-0001-0004-000000000001', 'Sandra Williams', 5, 'We manage a 200,000 sq ft office park and Lone Star handles it all. Great team, great communication, excellent results.', '2024-11-03', 'google'),
('44444444-0004-0001-0004-000000000001', 'David Chang', 4, 'Very professional operation. Pricing was competitive and the quality is excellent. Switching to them was one of the best decisions we made.', '2024-10-17', 'google'),

-- Big D Building Services
('55555555-0005-0001-0005-000000000001', 'Ashley Moore', 5, 'Big D manages our 35-location restaurant chain cleaning. Consistent quality everywhere. The ISO-certified processes really show.', '2024-12-12', 'google'),
('55555555-0005-0001-0005-000000000001', 'Tyler Johnson', 5, 'Outstanding company. They clean our downtown Dallas high-rise and the results speak for themselves. Windows, floors, everything perfect.', '2024-11-22', 'google'),
('55555555-0005-0001-0005-000000000001', 'Grace Kim', 5, 'Best cleaning company in DFW without question. They''re professional, efficient, and actually care about quality.', '2024-10-30', 'google'),

-- Cascade Commercial Cleaning (Seattle)
('77777777-0007-0001-0007-000000000001', 'Noah Christiansen', 5, 'We''re a certified green building and Cascade is the only company we found that truly meets our standards. Phenomenal.', '2024-12-09', 'google'),
('77777777-0007-0001-0007-000000000001', 'Emma Richardson', 5, 'Cascade has cleaned our tech startup office for 3 years. Never a complaint, always great. The green products are a huge bonus.', '2024-11-18', 'google'),
('77777777-0007-0001-0007-000000000001', 'James Liu', 4, 'Professional, eco-friendly, and responsive. A few minor misses early on but they course-corrected fast. Great company.', '2024-10-01', 'google'),

-- Mile High Commercial Cleaning (Denver)
('88888888-0008-0001-0008-000000000001', 'Sarah Patel', 5, 'Mile High transformed our LoDo office. The electrostatic disinfection was a game-changer post-COVID. Staff is wonderful.', '2024-12-03', 'google'),
('88888888-0008-0001-0008-000000000001', 'Kevin Martinez', 4, 'Great company, fair prices. They''ve been reliable for our co-working space for 2 years. Flexible scheduling is a huge plus.', '2024-11-07', 'google'),

-- Peach State (Atlanta)
('99999999-0009-0001-0009-000000000001', 'DeShawn Harris', 5, 'Peach State has been cleaning our corporate campus for 5 years. 400+ employees notice when something is off — and nothing ever is.', '2024-12-11', 'google'),
('99999999-0009-0001-0009-000000000001', 'Patricia Jones', 5, 'Minority-owned, professional, and excellent. Proud to support a local Atlanta business that delivers this level of quality.', '2024-11-25', 'google'),
('99999999-0009-0001-0009-000000000001', 'Thomas Baker', 4, 'Reliable and thorough. They''ve handled our Buckhead office building for years without issue. Good people.', '2024-10-14', 'google'),

-- South Beach Commercial Clean (Miami)
('aaaaaaaa-000a-0001-000a-0000000000a1', 'Isabella Fernandez', 5, 'The best cleaning company in Miami hands down. Bilingual team, always responsive, and the Brickell office has never looked better.', '2024-12-07', 'google'),
('aaaaaaaa-000a-0001-000a-0000000000a1', 'Marco Alvarez', 5, 'Same-day emergency service saved us before a big client visit. South Beach Clean is our permanent vendor now.', '2024-11-14', 'google'),
('aaaaaaaa-000a-0001-000a-0000000000a1', 'Rachel Cohen', 4, 'Very professional. They deal with Miami humidity and the beach environment really well. Our oceanfront office always smells fresh.', '2024-10-09', 'google');

-- ============================================================
-- SAMPLE LEADS (mix of open and contacted)
-- ============================================================

insert into leads (id, service_type, city, state, contact_name, contact_email, contact_phone, business_name, building_type, building_size, frequency, message, status, created_at) values

('bbbbbbbb-000b-0001-000b-0000000000b1', 'Office Cleaning', 'New York', 'NY', 'James Patterson', 'jpatterson@meridianlaw.com', '(212) 555-8001', 'Meridian Law Group', 'Office Building', '5,001–15,000 sq ft', 'Weekly', 'We need a reliable weekly cleaning service for our 23rd floor law office in Midtown. Looking for a team that can work evenings after 6pm. We have about 40 attorneys and staff.', 'open', now() - interval '2 hours'),

('bbbbbbbb-000b-0002-000b-0000000000b2', 'Medical Cleaning', 'Los Angeles', 'CA', 'Dr. Monica Reyes', 'mreyes@westsidepediatrics.com', '(310) 555-8002', 'Westside Pediatrics', 'Medical Office', '1,000–5,000 sq ft', 'Daily', 'Pediatric practice in Santa Monica looking for a cleaning company experienced with medical environments. Must be HIPAA-aware and use child-safe products.', 'open', now() - interval '5 hours'),

('bbbbbbbb-000b-0003-000b-0000000000b3', 'Janitorial', 'Chicago', 'IL', 'Robert Klein', 'rklein@kleindistributing.com', '(312) 555-8003', 'Klein Distributing Co.', 'Warehouse/Distribution', '15,001–50,000 sq ft', 'Weekly', 'We operate a 30,000 sq ft distribution warehouse near O''Hare. Need weekly floor scrubbing, restroom cleaning, and break room maintenance. Forklift traffic so floors take a beating.', 'open', now() - interval '12 hours'),

('bbbbbbbb-000b-0004-000b-0000000000b4', 'Post-Construction', 'Houston', 'TX', 'Angela Morrison', 'amorrison@morrisonrealty.com', '(713) 555-8004', 'Morrison Realty Group', 'Office Building', '5,001–15,000 sq ft', 'One-time', 'We just completed a full renovation of a 3-story office building in the Galleria area. Need a thorough post-construction clean before new tenants move in next Friday. Tight timeline.', 'open', now() - interval '18 hours'),

('bbbbbbbb-000b-0005-000b-0000000000b5', 'Floor Care', 'Dallas', 'TX', 'Michael Torres', 'mtorres@dallasretailgroup.com', '(214) 555-8005', 'Dallas Retail Group', 'Retail', '5,001–15,000 sq ft', 'Monthly', 'Managing 4 retail locations in the DFW area. Need monthly VCT strip and wax for all locations. High customer traffic so floors need to look their best at all times.', 'open', now() - interval '22 hours'),

('bbbbbbbb-000b-0006-000b-0000000000b6', 'Office Cleaning', 'Seattle', 'WA', 'Sarah Tanaka', 'stanaka@cascadetechco.com', '(206) 555-8006', 'Cascade Tech Co.', 'Office Building', '5,001–15,000 sq ft', 'Weekly', 'Growing tech company in South Lake Union. We have about 80 employees across 2 floors. Looking for a green-certified cleaning company — this is important to our culture and LEED certification requirements.', 'open', now() - interval '1 day'),

('bbbbbbbb-000b-0007-000b-0000000000b7', 'Industrial', 'Denver', 'CO', 'Chris Walters', 'cwalters@coloradomanufacturing.com', '(303) 555-8007', 'Colorado Advanced Manufacturing', 'Industrial/Manufacturing', '50,000+ sq ft', 'Weekly', 'CNC machine shop and manufacturing facility near I-70. Heavy metal shavings, coolant residue, and general grime. Need a company experienced with industrial environments and OSHA compliance.', 'open', now() - interval '1 day 6 hours'),

('bbbbbbbb-000b-0008-000b-0000000000b8', 'Carpet Cleaning', 'Atlanta', 'GA', 'Denise Washington', 'dwashington@atlantafinancial.com', '(404) 555-8008', 'Atlanta Financial Partners', 'Office Building', '5,001–15,000 sq ft', 'Quarterly', 'We have an executive suite with high-end carpet throughout. Need quarterly deep cleaning, ideally hot water extraction. About 8,000 sq ft total. Prefer weekend service.', 'open', now() - interval '2 days'),

('bbbbbbbb-000b-0009-000b-0000000000b9', 'Medical Cleaning', 'Miami', 'FL', 'Dr. Rafael Gutierrez', 'rgutierrez@miamiortho.com', '(305) 555-8009', 'Miami Orthopedic Center', 'Medical Office', '1,000–5,000 sq ft', 'Daily', 'Orthopedic surgery center in Coral Gables. Requires daily OR cleaning, waiting room, and office areas. Must be AHCA compliant. Looking to switch from current provider due to quality issues.', 'open', now() - interval '2 days 8 hours'),

('bbbbbbbb-000b-000a-000b-0000000000ba', 'Window Cleaning', 'Phoenix', 'AZ', 'Lindsay Carter', 'lcarter@phoenixrealty.com', '(602) 555-8010', 'Phoenix Commercial Realty', 'Office Building', '15,001–50,000 sq ft', 'Monthly', 'Property management company with 12 commercial buildings across Scottsdale and Tempe. Looking for a single vendor for monthly exterior window cleaning at all locations. Volume discount expected.', 'open', now() - interval '3 days'),

('bbbbbbbb-000b-000b-000b-0000000000bb', 'Janitorial', 'New York', 'NY', 'Frank Lombardi', 'flombardi@lombardirestaurants.com', '(718) 555-8011', 'Lombardi Restaurant Group', 'Restaurant/Food Service', '1,000–5,000 sq ft', 'Daily', 'We operate 3 fast-casual restaurants in Brooklyn. Need daily opening cleaning and weekly deep cleans for all 3 locations. Health code compliance is critical. Looking for 1 vendor to handle all sites.', 'contacted', now() - interval '4 days'),

('bbbbbbbb-000b-000c-000b-0000000000bc', 'Office Cleaning', 'Chicago', 'IL', 'Patricia Simmons', 'psimmons@simmonspublishing.com', '(312) 555-8012', 'Simmons Media Group', 'Office Building', '1,000–5,000 sq ft', 'Bi-weekly', 'Small publishing company in the West Loop. 25 employees, open plan office. Looking for bi-weekly cleaning with monthly deep clean. Eco-friendly products preferred.', 'contacted', now() - interval '5 days');
