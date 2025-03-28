package com.dgi.app.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_entree")
    private LocalDate dateEntree;

    @Column(name = "raison_sociale_noms_prenoms", nullable = false)
    private String raisonSocialeNomsPrenom;

    @Column(name = "cin")
    private String cin;

    @Column(name = "pm_pp")
    private String pmPp;

    @Column(name = "objet", columnDefinition = "TEXT")
    private String objet;

    @Column(name = "date_traitement")
    private LocalDate dateTraitement;

    @Column(name = "etat")
    private String etat;

    @Column(name = "IF")
    private String ifValue;

    @Column(name = "ICE")
    private String ice;

    @Column(name = "secteur")
    private String secteur;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private User agent;

    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    private String motifRejet;

    @Column(name = "tp")
    private String tp;

    @Column(name = "email")
    private String email;

    @Column(name = "gsm")
    private String gsm;

    @Column(name = "fix")
    private String fix;

    @Column(name = "remarque", columnDefinition = "TEXT")
    private String remarque;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    public Request() {
        this.dateEntree = LocalDate.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDateEntree() {
        return dateEntree;
    }

    public void setDateEntree(LocalDate dateEntree) {
        this.dateEntree = dateEntree;
    }

    public String getRaisonSocialeNomsPrenom() {
        return raisonSocialeNomsPrenom;
    }

    public void setRaisonSocialeNomsPrenom(String raisonSocialeNomsPrenom) {
        this.raisonSocialeNomsPrenom = raisonSocialeNomsPrenom;
    }

    public String getCin() {
        return cin;
    }

    public void setCin(String cin) {
        this.cin = cin;
    }

    public String getPmPp() {
        return pmPp;
    }

    public void setPmPp(String pmPp) {
        this.pmPp = pmPp;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public LocalDate getDateTraitement() {
        return dateTraitement;
    }

    public void setDateTraitement(LocalDate dateTraitement) {
        this.dateTraitement = dateTraitement;
    }

    public String getEtat() {
        return etat;
    }

    public void setEtat(String etat) {
        this.etat = etat;
    }

    public String getIfValue() {
        return ifValue;
    }

    public void setIfValue(String ifValue) {
        this.ifValue = ifValue;
    }

    public String getIce() {
        return ice;
    }

    public void setIce(String ice) {
        this.ice = ice;
    }

    public String getSecteur() {
        return secteur;
    }

    public void setSecteur(String secteur) {
        this.secteur = secteur;
    }

    public User getAgent() {
        return agent;
    }

    public void setAgent(User agent) {
        this.agent = agent;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public void setMotifRejet(String motifRejet) {
        this.motifRejet = motifRejet;
    }

    public String getTp() {
        return tp;
    }

    public void setTp(String tp) {
        this.tp = tp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGsm() {
        return gsm;
    }

    public void setGsm(String gsm) {
        this.gsm = gsm;
    }

    public String getFix() {
        return fix;
    }

    public void setFix(String fix) {
        this.fix = fix;
    }

    public String getRemarque() {
        return remarque;
    }

    public void setRemarque(String remarque) {
        this.remarque = remarque;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}