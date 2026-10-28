/* src/pages/Dashboard.module.css */

.container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, sans-serif;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  font-size: 16px;
  color: #6C757D;
}

.header {
  margin-bottom: 30px;
}

.titre {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 5px 0;
}

.sousTitre {
  font-size: 15px;
  color: #6C757D;
  margin: 0;
}

/* Cartes de stats */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.statCard {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border-left: 5px solid #C0392B; /* Rouge par défaut */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.statCard:hover {
  transform: translateY(-3px);
}

.statIcon {
  font-size: 24px;
  margin-bottom: 10px;
}

.statValue {
  font-size: 32px;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.statLabel {
  font-size: 13px;
  color: #6C757D;
  margin-top: 5px;
  font-weight: 500;
}

/* Sections */
.section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sectionTitle {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
  margin: 0;
}

.link {
  color: #C0392B;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

/* Alertes */
.alertesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.alerteCard {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #F8F9FA;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  align-items: flex-start;
}

.alerteIcon {
  font-size: 20px;
}

.alerteCard strong {
  display: block;
  font-size: 14px;
  color: #212529;
  margin-bottom: 3px;
}

.alerteCard p {
  font-size: 13px;
  color: #6C757D;
  margin: 0;
}

/* Tableau */
.tableContainer {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #6C757D;
  text-transform: uppercase;
  border-bottom: 2px solid #E9ECEF;
}

.table td {
  padding: 15px 12px;
  font-size: 14px;
  color: #212529;
  border-bottom: 1px solid #E9ECEF;
}

.refLink {
  color: #C0392B;
  font-weight: 600;
  text-decoration: none;
}

.refLink:hover {
  text-decoration: underline;
}

/* Badges de statut */
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge_demande_recue { background: #E3F2FD; color: #1976D2; }
.badge_a_contacter { background: #FFF3E0; color: #F57C00; }
.badge_disponibilites_a_verifier { background: #FFFDE7; color: #FBC02D; }
.badge_proposition_a_valider { background: #F3E5F5; color: #7B1FA2; }
.badge_confirmee { background: #E8F5E9; color: #2E7D32; }
.badge_annulee { background: #ECEFF1; color: #546E7A; }

.empty {
  text-align: center;
  color: #6C757D;
  padding: 20px;
  font-style: italic;
}
