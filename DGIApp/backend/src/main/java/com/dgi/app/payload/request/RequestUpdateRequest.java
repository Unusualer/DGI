package com.dgi.app.payload.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class RequestUpdateRequest {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateTraitement;

    @Size(max = 50)
    private String etat;

    @Size(max = 50)
    private String ifValue;

    @Size(max = 100)
    private String secteur;

    @Size(max = 1000)
    private String motifRejet;

    @Size(max = 50)
    private String tp;

    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String gsm;

    @Size(max = 20)
    private String fix;

    @Size(max = 1000)
    private String remarque;

    // Additional fields
    @Size(max = 20)
    private String cin;

    @Size(max = 20)
    private String ice;

    @Size(max = 255)
    private String raisonSocialeNomsPrenom;

    @Size(max = 10)
    private String pmPp;

    @Size(max = 1000)
    private String objet;

    public RequestUpdateRequest() {
        this.dateTraitement = LocalDate.now(); // Default to today
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

    public String getSecteur() {
        return secteur;
    }

    public void setSecteur(String secteur) {
        this.secteur = secteur;
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

    // Getters and setters for additional fields
    public String getCin() {
        return cin;
    }

    public void setCin(String cin) {
        this.cin = cin;
    }

    public String getIce() {
        return ice;
    }

    public void setIce(String ice) {
        this.ice = ice;
    }

    public String getRaisonSocialeNomsPrenom() {
        return raisonSocialeNomsPrenom;
    }

    public void setRaisonSocialeNomsPrenom(String raisonSocialeNomsPrenom) {
        this.raisonSocialeNomsPrenom = raisonSocialeNomsPrenom;
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
}