// All code here are self-written
const express = require("express");
module.exports = (db) => {
  const router = express.Router();

  // Which town in Singapore has the highest resale price in each month?
  router.get('/town-rankings', (req, res) => {
    const query = `
    SELECT 
        YEAR(p.month) AS year, 
        MONTH(p.month) AS month, 
        t.town AS town, 
        p.resale_price AS highest_price
    FROM 
        Price p
    JOIN 
        Flat f ON p.flat_id = f.flat_id
    JOIN 
        Location l ON f.location_id = l.location_id
    JOIN 
        Town t ON l.town_id = t.town_id
    JOIN 
        (
            SELECT 
                YEAR(p2.month) AS year, 
                MONTH(p2.month) AS month, 
                MAX(p2.resale_price) AS max_resale_price
            FROM 
                Price p2
            GROUP BY 
                YEAR(p2.month), MONTH(p2.month)
        ) max_prices
    ON 
        YEAR(p.month) = max_prices.year
        AND MONTH(p.month) = max_prices.month
        AND p.resale_price = max_prices.max_resale_price
    ORDER BY 
        year, month, highest_price DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching town rankings:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        res.render('town-rankings.mustache', { rankings: results });
    });
  });

  // What are the most common types of resale flats?
  router.get('/common-flat-types', (req, res) => {
    const query = `
    SELECT flat_type, COUNT(*) AS count
    FROM Flat
    GROUP BY flat_type
    ORDER BY count DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching town rankings:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        res.render('common-flat-types.mustache', { rankings: results });
    });
  });

  // Rank the top 10 years with the most flats built, and what are their average prices?
  router.get('/top10-flats-lease', (req, res) => {
    const query = `
      WITH YearlyFlats AS (
          SELECT 
              YEAR(l.lease_commence_date) AS year_built,
              COUNT(*) AS flats_built,
              ROUND(AVG(p.resale_price), 2) AS average_price
          FROM 
              Lease l
          JOIN 
              Flat f ON l.flat_id = f.flat_id
          JOIN 
              Price p ON f.flat_id = p.flat_id
          GROUP BY 
              YEAR(l.lease_commence_date)
      )
      SELECT 
          year_built,
          flats_built,
          average_price
      FROM 
          YearlyFlats
      ORDER BY 
          flats_built DESC
      LIMIT 10
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching town rankings:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        res.render('top10-flats-lease.mustache', { rankings: results });
    });
  });

  // How do the prices vary by flat type across the different towns?
  router.get('/avg-price-type-town', (req, res) => {
    const dataQuery = `
        SELECT 
            t.town AS town_name,
            f.flat_type,
            ROUND(AVG(p.resale_price), 2) AS average_price
        FROM 
            Town t
        JOIN 
            Location l ON t.town_id = l.town_id
        JOIN 
            Flat f ON l.location_id = f.location_id
        JOIN 
            Price p ON f.flat_id = p.flat_id
        GROUP BY 
            t.town, f.flat_type
        ORDER BY 
            t.town ASC, f.flat_type ASC;
        `;

    db.query(dataQuery, (err, data) => {
        if (err) {
            console.error('Error fetching price data:', err);
            res.status(500).send('Error fetching data');
            return;
        }

        res.render('avg-price-type-town.mustache', {
            data
        });
    });
  });

  // Are there visible effects of the COVID19 pandemic on the property prices?
  router.get('/effects-of-covid19', (req, res) => {
    const dataQuery = `
        SELECT 
            MONTH(month) AS month,
            YEAR(month) AS year,
            ROUND(AVG(resale_price), 2) AS average_resale_price,
            CASE 
                WHEN YEAR(month) < 2020 OR (YEAR(month) = 2020 AND MONTH(month) <= 2) THEN 'Pre-COVID'
                ELSE 'Post-COVID'
            END AS period
        FROM 
            Price
        WHERE 
            month BETWEEN '2019-12-01' AND '2021-12-31'
        GROUP BY 
            year, month
        ORDER BY 
            year, month
        `;

    db.query(dataQuery, (err, data) => {
        if (err) {
            console.error('Error fetching price data:', err);
            res.status(500).send('Error fetching data');
            return;
        }

        res.render('effects-of-covid19.mustache', {
            data
        });
    });
  });

  // On which streets were there the Top 10 most resale flats and what are their average resale prices?
  router.get('/most-flats-street', (req, res) => {
    const query = `
      SELECT 
          L.street_name,
          T.town,
          COUNT(F.flat_id) AS number_of_resale_flats,
          ROUND(AVG(P.resale_price), 2) AS average_resale_price
      FROM 
          Location L
      JOIN 
          Town T ON L.town_id = T.town_id
      JOIN 
          Flat F ON L.location_id = F.location_id
      JOIN 
          Price P ON F.flat_id = P.flat_id
      GROUP BY 
          L.street_name, T.town
      ORDER BY 
          number_of_resale_flats DESC
      LIMIT 10
      `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching town rankings:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        res.render('most-flats-street.mustache', { rankings: results });
    });
  });

  // What is the average resale price per square meter for every town?
  router.get('/avg-price-sqm', (req, res) => {
    const query = `
        SELECT 
            t.town,
            ROUND(AVG(p.resale_price / f.floor_area_sqm), 2) AS avg_resale_price_per_sqm
        FROM 
            Price p
        JOIN 
            Flat f ON p.flat_id = f.flat_id
        JOIN 
            Location l ON f.location_id = l.location_id
        JOIN 
            Town t ON l.town_id = t.town_id
        GROUP BY 
            t.town
        `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching town rankings:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        res.render('avg-price-sqm.mustache', { rankings: results });
    });
  });

  return router;
};
